import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { get, isAxiosError } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { BalancePayload } from '~/types/cosmos/balance';

export function useBalanceSWR(chain?: CosmosChain, suspense?: boolean) {
  const accounts = useAccounts(suspense);
  const { chromeStorage } = useChromeStorage();

  const address = (chain && accounts.data?.find((account) => account.id === chromeStorage.selectedAccountId)?.address[chain?.id]) || '';
  const { getBalance } = (chain && cosmosURL(chain)) ?? {};

  const requestURL = getBalance && getBalance(address);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<BalancePayload>(fetchUrl);
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, error, mutate } = useSWR<BalancePayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    suspense,
    isPaused: () => !address,
  });

  const returnData = data ? { balance: data.result ? data.result : data.balances, height: data.height } : undefined;

  return { data: returnData, error, mutate };
}
