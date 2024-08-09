import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { convertEVMToAssetName } from '~/Popup/utils/ethereum';
import type { EthereumNetwork } from '~/types/chain';
import type { ChainParams } from '~/types/cosmos/params';

import { useAllParamsSWR } from '../useAllParamsSWR';
import { useChainIdToAssetNameMapsSWR } from '../useChainIdToAssetNameMapsSWR';

export function useParamsSWR(network: EthereumNetwork, config?: SWRConfiguration) {
  const { data, error, mutate } = useAllParamsSWR(config);
  const { chainIdToAssetNameMaps } = useChainIdToAssetNameMapsSWR(config);

  const mappingName = useMemo(() => convertEVMToAssetName(network, chainIdToAssetNameMaps), [chainIdToAssetNameMaps, network]);

  const returnData = useMemo<ChainParams | null>(() => {
    if (!data) {
      return null;
    }

    return data[mappingName] || {};
  }, [data, mappingName]);

  return { data: returnData, error, mutate };
}
