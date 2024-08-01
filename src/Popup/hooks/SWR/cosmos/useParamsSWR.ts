import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { convertCosmosToAssetName } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { ChainParams } from '~/types/cosmos/params';

import { useAllParamsSWR } from '../useAllParamsSWR';
import { useChainIdToApiNameMapsSWR } from '../useChainIdToApiNameMapsSWR';

export function useParamsSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const { data, error, mutate } = useAllParamsSWR(config);
  const apiNameMaps = useChainIdToApiNameMapsSWR(config);

  const mappingName = useMemo(() => {
    if (apiNameMaps.chainIdToAssetNameMaps[chain.chainId]) {
      return apiNameMaps.chainIdToAssetNameMaps[chain.chainId];
    }

    return convertCosmosToAssetName(chain);
  }, [apiNameMaps.chainIdToAssetNameMaps, chain]);

  const returnData = useMemo<ChainParams | null>(() => {
    if (!data) {
      return null;
    }

    return data[mappingName] || {};
  }, [data, mappingName]);

  return { data: returnData, error, mutate };
}
