import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { getDefaultAV } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';

import { useParamsSWR } from './useParamsSWR';
import { useCurrentChain } from '../../useCurrent/useCurrentChain';

export function useGasMultiplySWR(chain?: CosmosChain, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();

  const currentCosmosChain = useMemo(() => chain || (currentChain.line === 'COSMOS' ? currentChain : COSMOS), [chain, currentChain]);

  const { data, error, mutate } = useParamsSWR(currentCosmosChain, config);

  const returnData = useMemo(
    () =>
      data?.params?.chainlist_params?.fee?.simul_gas_multiply ? String(data.params.chainlist_params.fee.simul_gas_multiply) : getDefaultAV(currentCosmosChain),
    [currentCosmosChain, data?.params?.chainlist_params?.fee?.simul_gas_multiply],
  );

  return { data: returnData, error, mutate };
}
