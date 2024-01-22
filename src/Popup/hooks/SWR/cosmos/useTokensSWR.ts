import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { convertCosmosToAssetName } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { CW20AssetResponse } from '~/types/cosmos/asset';

import { useChainNameMapsSWR } from './useChainNameMapsSWR';

export function useTokensSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const { data: chainNameMaps } = useChainNameMapsSWR();

  const mappingName = useMemo(() => convertCosmosToAssetName(chain, chainNameMaps), [chain, chainNameMaps]);

  const requestURL = useMemo(() => `https://front.api.mintscan.io/v3/assets/${mappingName}/cw20`, [mappingName]);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<CW20AssetResponse>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<CW20AssetResponse | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !(chain.line === 'COSMOS' && chain.cosmWasm),
    ...config,
  });

  const returnData: CW20AssetResponse['assets'] = useMemo(
    () =>
      data?.assets
        ? [
            ...data.assets.map((item) => ({
              ...item,
              image: item.image ? `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${item.image}` : undefined,
            })),
          ]
        : [],
    [data?.assets],
  );

  return { data: returnData, error, mutate };
}
