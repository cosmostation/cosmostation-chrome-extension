import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import type { ChainIdToAssetNameMapsResponse } from '~/types/cosmos/asset';

import { useAllParamsSWR } from './useAllParamsSWR';

export function useChainIdToApiNameMapsSWR(config?: SWRConfiguration) {
  const allParams = useAllParamsSWR(config);

  const chainIdToAssetNameMaps = useMemo<ChainIdToAssetNameMapsResponse>(() => {
    if (!allParams.data) {
      return {};
    }

    const keyValueSwappedMaps = Object.entries(allParams.data).reduce((acc: ChainIdToAssetNameMapsResponse, [key, value]) => {
      const apiName = key;

      const cosmosChainId = value.params?.chainlist_params?.chain_id_cosmos;
      const evmChainId = value.params?.chainlist_params?.chain_id_evm;

      if (cosmosChainId) {
        acc[cosmosChainId] = apiName;
      }

      if (evmChainId) {
        acc[evmChainId] = apiName;
      }

      return acc;
    }, {});

    return keyValueSwappedMaps;
  }, [allParams.data]);

  return { chainIdToAssetNameMaps };
}
