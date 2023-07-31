import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import { Squid } from '@0xsquid/sdk';

import { SQUID_BASE_URL } from '~/constants/squid';

export function useSquidSWR(config?: SWRConfiguration) {
  const fetcher = async (baseUrl: string) => {
    const squid = new Squid({
      baseUrl,
      executionSettings: {
        infiniteApproval: true,
      },
    });

    try {
      await squid.init();
      return squid;
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<Squid | null, unknown>(SQUID_BASE_URL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
