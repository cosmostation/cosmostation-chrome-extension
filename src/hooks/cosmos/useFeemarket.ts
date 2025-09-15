import { useMemo, useState } from 'react';

import type { EvmFeemarketResponse, FeemarketResponse } from '@/types/cosmos/feemarket';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { parseCoinId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseFeemarketProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useFeemarket({ coinId, config }: UseFeemarketProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const asset = getCosmosAccountAsset();

  // const isEnabledFeemarket = asset?.chain.feeInfo.isFeemarketEnabled;
  const isEnabledFeemarket = true;
  const isEvmFeemarket = asset?.chain.accountTypes?.some(
    (accountType) => accountType.pubkeyType === "/cosmos.evm.crypto.v1.ethsecp256k1.PubKey"
  ) ?? false;

  const requestURLs = useMemo(() => {
    if (!asset?.chain.lcdUrls) return [];

    const { chainId } = parseCoinId(coinId);

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));

    let feemarketEndpoints: string[];
    if (isEvmFeemarket) {
      feemarketEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getEvmFeemarket());
    } else {
      feemarketEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getFeemarket());
    }

    return feemarketEndpoints;
  }, [asset?.chain.lcdUrls, coinId, isEvmFeemarket]);

  const fetcher = async (index = 0) => {
    try {
      if (!isEnabledFeemarket) return null;

      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      let response: FeemarketResponse;
      if (isEvmFeemarket) {
        const evmResponse = await get<EvmFeemarketResponse>(requestURLs[index]);
        response = {
          prices: [
            {
              amount: evmResponse.base_fee,
              denom: asset!.chain.mainAssetDenom
            }
          ]
        }
      } else {
        response = await get<FeemarketResponse>(requestURLs[index]);
      }

      setIsAllRequestsFailed(false);

      return response;
    } catch {
      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        return null;
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['cosmosFeemarket', coinId],
    fetchFunction: () => fetcher(),
    config: {
      refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
      retry: false,
      enabled: !!coinId && !!requestURLs.length && !isAllRequestsFailed,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
