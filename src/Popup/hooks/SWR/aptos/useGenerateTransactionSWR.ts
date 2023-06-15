import { AptosClient } from 'aptos';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { APTOS } from '~/constants/chain/aptos/aptos';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { SubmitTransactionRequest } from '~/types/aptos/aptosClient';
import type { AptosSignPayload } from '~/types/message/aptos';

type FetchParams = {
  payload: AptosSignPayload;
  options?: SubmitTransactionRequest;
  address: string;
};

type useGenerateTransactionProps = {
  payload: AptosSignPayload;
  options?: SubmitTransactionRequest;
};

export function useGenerateTransactionSWR({ payload, options }: useGenerateTransactionProps, config?: SWRConfiguration) {
  const chain = APTOS;
  const accounts = useAccounts(config?.suspense);
  const { extensionStorage } = useExtensionStorage();
  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { restURL } = currentAptosNetwork;

  const aptosClient = new AptosClient(restURL);

  const address = accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';

  const fetcher = ({ address: addr, payload: pl, options: ops }: FetchParams) => aptosClient.generateTransaction(addr, pl, ops);

  const { data, error, mutate } = useSWR<Awaited<ReturnType<typeof fetcher>>, unknown>({ address, payload, options }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !address,
    ...config,
  });

  return { data, error, mutate };
}
