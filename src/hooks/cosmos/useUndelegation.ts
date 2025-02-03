import { useMemo, useState } from 'react';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type {} from '@/types/cosmos/delegation';
import type { UnbondingPayload } from '@/types/cosmos/undelegation';
import { get } from '@/utils/axios';
import { cosmosURL } from '@/utils/crypto/cosmos';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import { useAccountAssets } from '../useAccountAssets';

type UseUndelegationProps = {
  coinId: string;
  config?: UseQueryOptions<UnbondingPayload | null>;
};

export function useUndelegation({ coinId, config }: UseUndelegationProps) {
  const { data: accountAssets } = useAccountAssets();

  const [isAllRequestsFailed, setIsAllRequestsFailed] = useState(false);

  const chain = accountAssets?.cosmosAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const requestURLs = useMemo(() => {
    if (!chain?.address.address) return [];

    const cosmosEndpoints = chain?.chain.lcdUrls.map((chainEndpoint) => cosmosURL(chainEndpoint.url, coinId));
    const undelegationEndpoints = cosmosEndpoints?.map((cosmosEndpoint) => cosmosEndpoint.getUndelegations(chain?.address.address));

    return undelegationEndpoints;
  }, [chain?.address.address, chain?.chain.lcdUrls, coinId]);

  const fetcher = async (index = 0) => {
    try {
      if (!chain?.chain.isSupportStaking) return null;

      if (index >= requestURLs.length) {
        setIsAllRequestsFailed(true);

        throw new Error('All endpoints failed');
      }

      const response = await get<UnbondingPayload>(requestURLs[index]);

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
    queryKey: ['cosmosUndelegation', chain?.address.address],
    queryFn: () => fetcher(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 14,
    refetchInterval: isAllRequestsFailed ? false : 1000 * 15,
    retry: false,
    enabled: !!coinId && !!chain?.address.address && !!requestURLs.length && !isAllRequestsFailed,
    ...config,
  });

  const returnData = useMemo(() => {
    if (data) {
      if (data.unbonding_responses) {
        return data.unbonding_responses?.map((item) =>
          item.entries.map((entry) => ({ delegator_address: item.delegator_address, validator_address: item.validator_address, entries: entry })),
        );
      }

      if (data.result) {
        return data.result.map((item) =>
          item.entries.map((entry) => ({ delegator_address: item.delegator_address, validator_address: item.validator_address, entries: entry })),
        );
      }
    }
    return [];
  }, [data]);

  const flattenData = useMemo(() => returnData?.flat() || [], [returnData]);

  return { data: flattenData, error, refetch, isLoading };
}
