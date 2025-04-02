import { useMemo, useState } from 'react';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { Delegation, DelegationPayload, KavaDelegationPayload } from '@/types/cosmos/delegation';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { parseCoinId } from '@/utils/queryParamGenerator';

import { useGetAccountAsset } from '../useGetAccountAsset';

type UseDelegationProps = {
  coinId: string;
  config?: UseQueryOptions<DelegationPayload | KavaDelegationPayload | null>;
};

export function useDelegation({ coinId, config }: UseDelegationProps) {
  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const asset = getCosmosAccountAsset();

  const requestURLs = useMemo(() => {
    if (!asset?.address.address) return [];

    const { chainId } = parseCoinId(coinId);

    const cosmosEndpoints = asset?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, chainId));
    const delegationEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getDelegations(asset?.address.address));

    return delegationEndpoints;
  }, [asset?.address.address, asset?.chain.lcdUrls, coinId]);

  const fetcher = async (index = 0) => {
    try {
      if (!asset?.chain.isSupportStaking) return null;

      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const response = await get<DelegationPayload | KavaDelegationPayload>(requestURLs[index]);

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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cosmosDelegation', asset?.address.address],
    queryFn: () => fetcher(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 14,
    refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
    retry: false,
    enabled: !!coinId && !!asset?.address.address && !!requestURLs.length && !isAllRequestsFailed,
    ...config,
  });

  const isKavaPayload = (payload: DelegationPayload | KavaDelegationPayload): payload is KavaDelegationPayload =>
    (payload as KavaDelegationPayload).result?.[0]?.delegation?.delegator_address !== undefined;

  const returnData: Delegation[] = useMemo(() => {
    if (data) {
      if (isKavaPayload(data)) {
        if (data.result) {
          return data.result.map((delegation) => ({
            delegatorAddress: delegation.delegation?.delegator_address || '',
            validatorAddress: delegation.delegation?.validator_address || '',
            amount: delegation.balance,
          }));
        }

        return [];
      }

      if (data.delegation_responses) {
        return data.delegation_responses.map((delegation) => ({
          delegatorAddress: delegation.delegation.delegator_address,
          validatorAddress: delegation.delegation.validator_address,
          amount: delegation.balance,
        }));
      }

      if (data.result) {
        return data.result.map((delegation) => {
          const amount = typeof delegation.balance === 'string' ? delegation.balance : delegation.balance.amount;
          const denom = typeof delegation.balance === 'string' ? asset?.asset.id || parseCoinId(coinId).id : delegation.balance.denom;

          return {
            delegatorAddress: delegation.delegator_address,
            validatorAddress: delegation.validator_address,
            amount: {
              amount,
              denom,
            },
          };
        });
      }
    }
    return [];
  }, [asset?.asset.id, coinId, data]);

  return { data: returnData, error, refetch, isLoading };
}
