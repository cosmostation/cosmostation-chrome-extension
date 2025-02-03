import { useMemo, useState } from 'react';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { Delegation, DelegationPayload, KavaDelegationPayload } from '@/types/cosmos/delegation';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { isMatchingCoinId, parseCoinId } from '@/utils/queryParamGenerator';

import { useAccountAssets } from '../useAccountAssets';

type UseDelegationProps = {
  coinId: string;
  config?: UseQueryOptions<DelegationPayload | KavaDelegationPayload | null>;
};

export function useDelegation({ coinId, config }: UseDelegationProps) {
  const { data: accountAssets } = useAccountAssets();

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const chain = accountAssets?.cosmosAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const requestURLs = useMemo(() => {
    if (!chain?.address.address) return [];

    const cosmosEndpoints = chain?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, coinId));
    const delegationEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getDelegations(chain?.address.address));

    return delegationEndpoints;
  }, [chain?.address.address, chain?.chain.lcdUrls, coinId]);

  // FIXME 이 방법은 매 요청마다 불필요한 요청이 포함되긴 함.  -> 성공하기 전 엔드포인트 모두에 불필요하게 요청하고있으니꼐
  const fetcher = async (index = 0) => {
    try {
      if (!chain?.chain.isSupportStaking) return null;

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
    queryKey: ['cosmosDelegation', chain?.address.address],
    queryFn: () => fetcher(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 14,
    refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
    retry: false,
    enabled: !!coinId && !!chain?.address.address && !!requestURLs.length && !isAllRequestsFailed,
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
          const denom = typeof delegation.balance === 'string' ? chain?.asset.id || parseCoinId(coinId).id : delegation.balance.denom;

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
  }, [chain?.asset.id, coinId, data]);

  return { data: returnData, error, refetch, isLoading };
}
