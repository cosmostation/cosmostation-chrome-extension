import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { DEFAULT_TIMEOUT_HEIGHT } from '~/constants/cosmos';
import { plus } from '~/Popup/utils/big';
import type { CosmosChain } from '~/types/chain';

import { useBlockLatestSWR } from './useBlockLatestSWR';
import { useCurrentChain } from '../../useCurrent/useCurrentChain';
import { useParamsSWR } from '../useParamsSWR';

export function useTimeoutHeightSWR(chain?: CosmosChain, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();

  const currentCosmosChain = useMemo(() => chain || (currentChain.line === 'COSMOS' ? currentChain : COSMOS), [chain, currentChain]);

  const params = useParamsSWR(currentCosmosChain);
  const sourceChainLatestBlock = useBlockLatestSWR(currentCosmosChain, config?.suspense);

  const timeoutHeight = useMemo(() => {
    const sourceChainBlockHeight = sourceChainLatestBlock.data?.block?.header?.height;

    const defaultTimeoutHeightIncrement = params.data?.params?.chainlist_params?.tx_timeout_add || DEFAULT_TIMEOUT_HEIGHT;

    if (sourceChainBlockHeight) {
      return plus(defaultTimeoutHeightIncrement, sourceChainBlockHeight);
    }

    return undefined;
  }, [params.data?.params?.chainlist_params?.tx_timeout_add, sourceChainLatestBlock.data?.block?.header?.height]);

  return { data: timeoutHeight, error: sourceChainLatestBlock.error, mutate: sourceChainLatestBlock.mutate };
}
