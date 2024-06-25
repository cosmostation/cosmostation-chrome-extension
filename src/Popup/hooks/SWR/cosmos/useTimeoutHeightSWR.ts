import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import type { CosmosChain } from '~/types/chain';

import { useBlockLatestSWR } from './useBlockLatestSWR';

export function useTimeoutHeightSWR(chain?: CosmosChain, config?: SWRConfiguration) {
  const sourceChainLatestBlock = useBlockLatestSWR(chain, config?.suspense);

  const timeoutHeight = useMemo(() => {
    const sourceChainBlockHeight = sourceChainLatestBlock.data?.block?.header?.height;

    return sourceChainBlockHeight ? String(30 + parseInt(sourceChainBlockHeight, 10)) : undefined;
  }, [sourceChainLatestBlock.data?.block?.header?.height]);

  return { data: timeoutHeight, error: sourceChainLatestBlock.error, mutate: sourceChainLatestBlock.mutate };
}
