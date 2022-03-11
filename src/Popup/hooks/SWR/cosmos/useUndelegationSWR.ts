import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { Unbonding, UnbondingPayload } from '~/types/cosmos/undelegation';

export function useUndelegationSWR(address: string, chain: CosmosChain, suspense?: boolean) {
  const { getUndelegations } = cosmosURL(chain);

  const requestURL = getUndelegations(address);

  const fetcher = (fetchUrl: string) => get<UnbondingPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<UnbondingPayload, AxiosError>(requestURL, fetcher, {
    refreshInterval: 0,
    errorRetryCount: 5,
    errorRetryInterval: 3000,
    suspense,
  });

  const returnData: Unbonding[][] | undefined = useMemo(() => {
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

  return { data: flattenData, error, mutate };
}
