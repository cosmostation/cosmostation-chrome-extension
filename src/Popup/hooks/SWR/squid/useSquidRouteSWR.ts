import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { GetRoute, RouteResponse } from '@0xsquid/sdk';

import { useSquidSDkSWR } from './useSquidSDKSWR';

export function useSquidRouteSWR(routeParam: GetRoute, config?: SWRConfiguration) {
  const squidSDK = useSquidSDkSWR();

  const fetcher = async (param: GetRoute) => squidSDK.data?.getRoute(param);

  const { data, isValidating, error, mutate } = useSWR<RouteResponse | undefined, unknown>(routeParam, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !routeParam,
    ...config,
  });

  return { data, isValidating, error, mutate };
}
