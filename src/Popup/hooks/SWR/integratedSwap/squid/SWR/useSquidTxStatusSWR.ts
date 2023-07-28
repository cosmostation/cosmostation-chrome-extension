import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { GetStatus, StatusResponse } from '@0xsquid/sdk';

import { useSquidSWR } from './useSquidSWR';

export function useSquidTxStatusSWR(tx: GetStatus, config?: SWRConfiguration) {
  const squid = useSquidSWR({ suspense: true });

  const fetcher = async (txhash: GetStatus) => squid.data?.getStatus(txhash);

  const { data, isValidating, error, mutate } = useSWR<StatusResponse | undefined, unknown>(tx, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, isValidating, error, mutate };
}
