import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import { Squid } from '@0xsquid/sdk';

import { SQUID_BASE_URL, SQUID_INTEGRATOR_ID } from '~/constants/squid';

type SquidConfigParam = {
  baseUrl: string;
  integratorId: string;
};

export function useSquidSWR(config?: SWRConfiguration) {
  const fetcher = async ({ baseUrl, integratorId }: SquidConfigParam) => {
    const squid = new Squid({
      baseUrl,
      integratorId,
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

  const { data, error, mutate } = useSWR<Squid | null, unknown>({ baseUrl: SQUID_BASE_URL, integratorId: SQUID_INTEGRATOR_ID }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
