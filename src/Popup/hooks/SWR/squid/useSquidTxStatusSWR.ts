import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { GetStatus, StatusResponse } from '@0xsquid/sdk';
import { Squid } from '@0xsquid/sdk';

export function useSquidTxStatusSWR(tx: GetStatus, config?: SWRConfiguration) {
  const squid = new Squid({
    baseUrl: 'https://api.0xsquid.com',
  });

  const fetcher = async (txhash: GetStatus) => {
    await squid.init();
    const status = await squid.getStatus(txhash);
    return status;
  };

  const { data, isValidating, error, mutate } = useSWR<StatusResponse | undefined, unknown>(tx, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, isValidating, error, mutate };
}
