import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { PoolResponse } from '~/types/cosmos/pool';

export function usePoolsSWR(pool_id: string, config?: SWRConfiguration) {
  const fetcher = async () => {
    try {
      return await get<PoolResponse>(`https://lcd-osmosis-app.cosmostation.io/osmosis/gamm/v1beta1/pools/${pool_id}`);
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<PoolResponse | null, AxiosError>({}, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 0,
    errorRetryCount: 0,
    isPaused: () => !pool_id,
    ...config,
  });

  return { data, error, mutate };
}
