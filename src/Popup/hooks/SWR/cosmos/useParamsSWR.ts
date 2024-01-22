import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { convertCosmosToAssetName } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { ParamsResponse } from '~/types/cosmos/params';

import { useChainNameMapsSWR } from './useChainNameMapsSWR';

export function useParamsSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const { data: chainNameMaps } = useChainNameMapsSWR();

  const mappingName = useMemo(() => convertCosmosToAssetName(chain, chainNameMaps), [chain, chainNameMaps]);

  const requestURL = useMemo(() => `https://front.api.mintscan.io/v10/utils/params/${mappingName}`, [mappingName]);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<ParamsResponse>(fetchUrl);
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<ParamsResponse | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 0,
    errorRetryCount: 0,
    isPaused: () => !chain,
    ...config,
  });

  return { data, error, mutate };
}
