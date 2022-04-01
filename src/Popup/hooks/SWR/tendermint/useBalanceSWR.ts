import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { get } from '~/Popup/utils/axios';
import { tendermintURL } from '~/Popup/utils/tendermint';
import type { TendermintChain } from '~/types/chain';
import type { BalancePayload } from '~/types/tendermint/balance';

export function useBalanceSWR(chain: TendermintChain, suspense?: boolean) {
  const accounts = useAccounts(suspense);
  const { chromeStorage } = useChromeStorage();

  const address = accounts.data?.find((account) => account.id === chromeStorage.selectedAccountId)?.address[chain.id] || '';
  const { getBalance } = tendermintURL(chain);

  const requestURL = getBalance(address);

  const fetcher = (fetchUrl: string) => get<BalancePayload>(fetchUrl);

  const { data, error, mutate } = useSWR<BalancePayload, AxiosError>(requestURL, fetcher, {
    refreshInterval: 15000,
    errorRetryCount: 5,
    errorRetryInterval: 3000,
    suspense,
    isPaused: () => !address,
  });

  const returnData = data ? { balance: data.result ? data.result : data.balances, height: data.height } : undefined;

  return { data: returnData, error, mutate };
}
