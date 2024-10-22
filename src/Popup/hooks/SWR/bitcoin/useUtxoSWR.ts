import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { get } from '~/Popup/utils/axios';
import type { Utxo } from '~/types/bitcoin/balance';
import type { BitcoinChain } from '~/types/chain';

type FetchParams = {
  url: string;
  address?: string;
};

export function useUtxoSWR(chain: BitcoinChain, config?: SWRConfiguration) {
  const accounts = useAccounts(config?.suspense);
  const { extensionStorage } = useExtensionStorage();

  const address = useMemo(
    () => accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '',
    [accounts.data, chain.id, extensionStorage.selectedAccountId],
  );

  const url = useMemo(() => `${chain.mempoolURL}/address/${address}/utxo`, [address, chain.mempoolURL]);

  const fetcher = (params: FetchParams) => {
    if (!params.address) {
      throw new Error('Address is required');
    }

    return get<Utxo[]>(url);
  };

  const { data, error, mutate } = useSWR<Utxo[], AxiosError>({ url, address }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 59000,
    refreshInterval: 60000,
    errorRetryCount: 0,
    isPaused: () => !address,
    ...config,
  });

  return { data, error, mutate };
}
