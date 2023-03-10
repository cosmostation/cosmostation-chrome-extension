import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { GetRoute, RouteResponse } from '@0xsquid/sdk';
import { Squid } from '@0xsquid/sdk';

export function useSquidRouteSWR(routeParam?: GetRoute, config?: SWRConfiguration) {
  const squid = new Squid({
    baseUrl: 'https://api.0xsquid.com',
  });

  const fetcher = async (param: GetRoute) => {
    await squid.init();
    const route = await squid.getRoute(param);
    return route;
  };

  const { data, isValidating, error, mutate } = useSWR<RouteResponse | undefined, unknown>(routeParam, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !routeParam,
    ...config,
  });

  return { data, isValidating, error, mutate };
}
