import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import type { ChainIdToAssetNameMapsResponse } from '~/types/cosmos/asset';

import { useAllParamsSWR } from './useAllParamsSWR';

export function useChainIdToAssetNameMapsSWR(config?: SWRConfiguration) {
  const allParams = useAllParamsSWR(config);

  const chainIdToAssetNameMaps = useMemo<ChainIdToAssetNameMapsResponse>(() => {
    const keyValueSwappedMaps = Object.fromEntries(
      Object.entries(allParams.data).map(([key, value]) => {
        const newKey = value.params?.chainlist_params?.chain_id_cosmos || value.chain_id || '';
        const newValue = key;

        return [newKey, newValue];
      }),
    );
    return keyValueSwappedMaps;
  }, [allParams]);

  return { chainIdToAssetNameMaps };
}
