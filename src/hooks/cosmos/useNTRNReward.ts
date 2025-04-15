import { useMemo } from 'react';

import { NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { NEUTRON_STAKE_CONTRACT_ADDRESS, NEUTRON_TESTNET_STAKE_CONTRACT_ADDRESS } from '@/constants/cosmos/contract';
import { useFetch, type UseFetchConfig } from '@/hooks/common/useFetch';
import type { NTRNRewardsResponse } from '@/types/cosmos/contract';
import { get, isAxiosError } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { parseCoinId } from '@/utils/queryParamGenerator';

import { useGetAccountAsset } from '../useGetAccountAsset';

type UseNTRNRewardProps = {
  coinId?: string;
  config?: UseFetchConfig;
};

export function useNTRNReward({ coinId, config }: UseNTRNRewardProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId: coinId || '' });

  const asset = getCosmosAccountAsset();

  const isNTRN = [NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID].some((item) => item === parseCoinId(coinId || '').chainId);

  const requestURLs = useMemo(() => {
    if (!asset?.address.address) return [];

    const { chainId } = parseCoinId(coinId || '');

    const contractAddress = (() => {
      if (chainId === NEUTRON_CHAINLIST_ID) return NEUTRON_STAKE_CONTRACT_ADDRESS;

      if (chainId === NEUTRON_TESTNET_CHAINLIST_ID) return NEUTRON_TESTNET_STAKE_CONTRACT_ADDRESS;
      return undefined;
    })();

    if (!contractAddress) return [];

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));
    const ntrnRewardEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getNTRNRewards(contractAddress, asset.address.address)).filter(Boolean);

    return ntrnRewardEndpoints;
  }, [asset?.address.address, asset?.chain.lcdUrls, coinId]);

  const fetcher = async () => {
    for (const requestURL of requestURLs) {
      try {
        const returnData = await get<NTRNRewardsResponse>(requestURL, { timeout: 1000 * 2 });

        return returnData;
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 404) {
          return null;
        }
        continue;
      }
    }

    throw new Error('All endpoints failed');
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useNTRNReward', coinId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!requestURLs.length && isNTRN,
      ...config,
    },
  });

  return { data, isLoading, error, refetch };
}
