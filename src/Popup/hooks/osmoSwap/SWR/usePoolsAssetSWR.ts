import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { PoolsAssetResponse } from '~/types/cosmos/pool';

export function usePoolsAssetSWR(chainName?: string, config?: SWRConfiguration) {
  const requestURL = `https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/${chainName || ''}/pool.json`;

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<PoolsAssetResponse>(fetchUrl);
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<PoolsAssetResponse | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 0,
    errorRetryCount: 0,
    isPaused: () => !chainName,
    ...config,
  });

  return { data, error, mutate };
}
