import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { NEUTRON } from '~/constants/chain/cosmos/neutron';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { get, isAxiosError } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { UnbondingPayload } from '~/types/cosmos/undelegation';

export function useUndelegationSWR(chain: CosmosChain, suspense?: boolean) {
  const accounts = useAccounts(suspense);
  const { extensionStorage } = useExtensionStorage();

  const address = accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

  const { getUndelegations } = cosmosURL(chain);

  const requestURL = getUndelegations(address);

  const fetcher = async (fetchUrl: string) => {
    try {
      if (chain.id === NEUTRON.id) {
        return null;
      }

      return await get<UnbondingPayload>(fetchUrl);
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, error, mutate } = useSWR<UnbondingPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    suspense,
    isPaused: () => !address,
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

  return { data: flattenData, error, mutate };
}
