import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { get } from '~/Popup/utils/axios';
import { tendermintURL } from '~/Popup/utils/tendermint';
import type { TendermintChain } from '~/types/chain';
import type { Delegation, DelegationPayload, KavaDelegationPayload } from '~/types/tendermint/delegation';

export function useDelegationSWR(chain: TendermintChain, suspense?: boolean) {
  const accounts = useAccounts(suspense);
  const { chromeStorage } = useChromeStorage();

  const address = accounts.data?.find((account) => account.id === chromeStorage.selectedAccountId)?.address[chain.id] || '';

  const { getDelegations } = tendermintURL(chain);

  const requestURL = getDelegations(address);

  const fetcher = (fetchUrl: string) => get<DelegationPayload | KavaDelegationPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<DelegationPayload | KavaDelegationPayload, AxiosError>(requestURL, fetcher, {
    refreshInterval: 15000,
    errorRetryCount: 5,
    errorRetryInterval: 3000,
    suspense,
    isPaused: () => !address,
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
          const denom = typeof delegation.balance === 'string' ? chain.baseDenom : delegation.balance.denom;

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
  }, [chain.baseDenom, data]);

  return {
    mutate,
    data: returnData,
    error,
  };
}
