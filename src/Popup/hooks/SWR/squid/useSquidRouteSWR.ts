import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { GetRoute, RouteResponse } from '@0xsquid/sdk';
import { Squid } from '@0xsquid/sdk';

import { SQUID_BASE_URL } from '~/constants/squid';

type RouteError = {
  errors?: {
    error: string;
    message: string;
    errorType: string;
  }[];
};

export function useSquidRouteSWR(routeParam?: GetRoute, config?: SWRConfiguration) {
  const fetcher = async (param: GetRoute) => {
    const squid = new Squid({
      baseUrl: SQUID_BASE_URL,
    });

    await squid.init();
    return squid.getRoute(param);
  };

  const { data, isValidating, error, mutate } = useSWR<RouteResponse | undefined, RouteError>(routeParam, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => !routeParam,
    ...config,
  });

  return { data, isValidating, error, mutate };
}
