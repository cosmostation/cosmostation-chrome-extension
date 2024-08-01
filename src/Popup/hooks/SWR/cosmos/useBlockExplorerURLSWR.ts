import { useCallback } from 'react';
import type { SWRConfiguration } from 'swr';

import { removeTrailSlash } from '~/Popup/utils/fetch';
import type { CosmosChain } from '~/types/chain';

import { useParamsSWR } from '../useParamsSWR';

export function useBlockExplorerURLSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const chainParams = useParamsSWR(chain, config);

  const getExplorerURL = useCallback(
    () => removeTrailSlash(chainParams.data?.params?.chainlist_params?.explorer?.url || chain.explorerURL),
    [chain.explorerURL, chainParams.data?.params?.chainlist_params?.explorer?.url],
  );

  const getExplorerAccountURL = useCallback(
    (address?: string) => {
      if (!address) return '';

      const explorerAccountURL = chainParams.data?.params?.chainlist_params?.explorer?.account || chain.accountExplorerURL;

      // eslint-disable-next-line no-template-curly-in-string
      return explorerAccountURL?.replace('${address}', address) || '';
    },
    [chain.accountExplorerURL, chainParams.data?.params?.chainlist_params?.explorer?.account],
  );

  const getExplorerTxDetailURL = useCallback(
    (txHash?: string) => {
      if (!txHash) return '';

      const explorerTxDetailURL = chainParams.data?.params?.chainlist_params?.explorer?.tx || chain.txDetailExplorerURL;

      // eslint-disable-next-line no-template-curly-in-string
      return explorerTxDetailURL?.replace('${hash}', txHash) || '';
    },
    [chain.txDetailExplorerURL, chainParams.data?.params?.chainlist_params?.explorer?.tx],
  );

  const getExplorerBlockDetailURL = useCallback(
    (blockHeight?: string) => {
      if (!blockHeight) return '';

      // eslint-disable-next-line no-template-curly-in-string
      return chain.blockDetailExplorerURL?.replace('${blockHeight}', blockHeight) || '';
    },
    [chain.blockDetailExplorerURL],
  );

  return { getExplorerURL, getExplorerAccountURL, getExplorerTxDetailURL, getExplorerBlockDetailURL };
}
