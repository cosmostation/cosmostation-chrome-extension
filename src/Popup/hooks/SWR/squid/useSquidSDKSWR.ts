import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import { Squid } from '@0xsquid/sdk';

export function useSquidSDkSWR(config?: SWRConfiguration) {
  const squid = new Squid({
    baseUrl: 'https://api.0xsquid.com',
  });

  const fetcher = async () => {
    try {
      await squid.init();
      return squid;
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<Squid | null, unknown>('key', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
