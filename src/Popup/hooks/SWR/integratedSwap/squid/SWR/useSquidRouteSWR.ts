import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { GetRoute, RouteResponse } from '@0xsquid/sdk';

import { useSquidSWR } from './useSquidSWR';

type RouteError = {
  errors?: {
    error: string;
    message: string;
    errorType: string;
  }[];
};

export function useSquidRouteSWR(routeParam?: GetRoute, config?: SWRConfiguration) {
  const squid = useSquidSWR({ suspense: true });

  const fetcher = async (param: GetRoute) => squid.data?.getRoute(param);

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
