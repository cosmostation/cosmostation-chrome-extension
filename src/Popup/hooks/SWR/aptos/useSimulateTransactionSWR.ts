import type { AptosAccount } from 'aptos';
import { AptosClient } from 'aptos';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import type { Query, RawTransaction } from '~/types/aptos/aptosClient';

type FetchParams = {
  rawTransaction: RawTransaction;
};

type useSimulateTransactionProps = {
  aptosAccount: AptosAccount;
  rawTransaction?: RawTransaction;
  query?: Query;
};

export function useSimulateTransactionSWR({ aptosAccount, rawTransaction, query }: useSimulateTransactionProps, config?: SWRConfiguration) {
  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { restURL } = currentAptosNetwork;

  const aptosClient = new AptosClient(restURL);

  const fetcher = ({ rawTransaction: rawTx }: FetchParams) => aptosClient.simulateTransaction(aptosAccount, rawTx, query);

  const { data, error, mutate } = useSWR<Awaited<ReturnType<typeof fetcher>>, unknown>({ rawTransaction }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !rawTransaction,
    ...config,
  });

  return {
    data,
    error,
    mutate,
  };
}
