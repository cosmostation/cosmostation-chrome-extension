import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { GetStatus, StatusResponse } from '@0xsquid/sdk';
import { Squid } from '@0xsquid/sdk';

import { SQUID_BASE_URL } from '~/constants/squid';

export function useSquidTxStatusSWR(tx: GetStatus, config?: SWRConfiguration) {
  const fetcher = async (txhash: GetStatus) => {
    const squid = new Squid({
      baseUrl: SQUID_BASE_URL,
    });

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
