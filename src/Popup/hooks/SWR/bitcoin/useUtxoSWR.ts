import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { BITCOIN } from '~/constants/chain/bitcoin/bitcoin';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentBitcoinNetwork } from '~/Popup/hooks/useCurrent/useCurrentBitcoinNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { get } from '~/Popup/utils/axios';
import type { UtxoPayload } from '~/types/bitcoin/balance';
import type { BitcoinNetwork } from '~/types/chain';

type FetchParams = {
  address?: string;
};

export function useUtxoSWR(network?: BitcoinNetwork, config?: SWRConfiguration) {
  const chain = BITCOIN;
  const accounts = useAccounts(config?.suspense);
  const { extensionStorage } = useExtensionStorage();
  const { currentBitcoinNetwork } = useCurrentBitcoinNetwork();

  const bitcoinNetwork = useMemo(() => network || currentBitcoinNetwork, [network, currentBitcoinNetwork]);

  const utxoURL = useMemo(() => bitcoinNetwork.utxoURL, [bitcoinNetwork]);

  const address = accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

  const fetcher = (params: FetchParams) => {
    const url = utxoURL.replace('{address}', params.address || '');
    return get<UtxoPayload>(url);
  };

  const { data, error, mutate } = useSWR<UtxoPayload, AxiosError>({ address }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => !address,
    ...config,
  });

  return { data, error, mutate };
}
