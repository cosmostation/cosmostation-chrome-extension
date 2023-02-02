import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { PoolResponse } from '~/types/cosmos/pool';

export function usePoolSWR(poolId?: string, config?: SWRConfiguration) {
  const requestURL = `https://lcd-osmosis-app.cosmostation.io/osmosis/gamm/v1beta1/pools/${poolId || ''}`;

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<PoolResponse>(fetchUrl);
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<PoolResponse | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 14000,
    errorRetryCount: 0,
    isPaused: () => !poolId,
    ...config,
  });

  return { data, error, mutate };
}
