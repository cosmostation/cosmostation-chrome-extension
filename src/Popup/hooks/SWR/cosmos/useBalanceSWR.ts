import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { get, isAxiosError } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { BalancePayload } from '~/types/cosmos/balance';

export function useBalanceSWR(chain: CosmosChain, suspense?: boolean) {
  const accounts = useAccounts(suspense);
  const { extensionStorage } = useExtensionStorage();

  const address = accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';
  const { getBalance } = cosmosURL(chain);

  const requestURL = getBalance(address);

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
    isPaused: () => !address || !chain,
  });

  const returnData = data ? { balance: data.result ? data.result : data.balances, height: data.height } : undefined;

  return { data: returnData, error, mutate };
}
