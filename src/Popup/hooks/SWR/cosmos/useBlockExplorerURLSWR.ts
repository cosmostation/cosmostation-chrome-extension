import { useCallback } from 'react';
import type { SWRConfiguration } from 'swr';

import { BLOCK_EXPLORER_PATH } from '~/constants/common';
import { removeTrailSlash } from '~/Popup/utils/fetch';
import type { CosmosChain } from '~/types/chain';

import { useParamsSWR } from './useParamsSWR';

export function useBlockExplorerURLSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const chainParams = useParamsSWR(chain, config);

  const getExplorerURL = useCallback(
    () => removeTrailSlash(chainParams.data?.params?.chainlist_params?.explorer?.url || chain.explorerURL),
    [chain.explorerURL, chainParams.data?.params?.chainlist_params?.explorer?.url],
  );

  const getExplorerAccountURL = useCallback(
    (address?: string) => {
      if (!address) return '';

      const explorerAccountURL = chainParams.data?.params?.chainlist_params?.explorer?.account;

      if (explorerAccountURL) {
        return explorerAccountURL.replace(`\${${BLOCK_EXPLORER_PATH.ACCOUNT}}`, address);
      }

      const explorerBaseURL = getExplorerURL();
      return explorerBaseURL ? `${explorerBaseURL}/address/${address}` : '';
    },
    [chainParams.data?.params?.chainlist_params?.explorer?.account, getExplorerURL],
  );

  const getExplorerTxDetailURL = useCallback(
    (txHash?: string) => {
      if (!txHash) return '';

      const explorerTxDetailURL = chainParams.data?.params?.chainlist_params?.explorer?.tx;

      if (explorerTxDetailURL) {
        return explorerTxDetailURL?.replace(`\${${BLOCK_EXPLORER_PATH.TX}}`, txHash) || '';
      }

      const explorerBaseURL = getExplorerURL();
      return explorerBaseURL ? `${explorerBaseURL}/tx/${txHash}` : '';
    },
    [chainParams.data?.params?.chainlist_params?.explorer?.tx, getExplorerURL],
  );

  const getExplorerBlockDetailURL = useCallback(
    (blockHeight?: string) => {
      if (!blockHeight) return '';

      const explorerBaseURL = getExplorerURL();
      return explorerBaseURL ? `${explorerBaseURL}/block/${blockHeight}` : '';
    },
    [getExplorerURL],
  );

  return { getExplorerURL, getExplorerAccountURL, getExplorerTxDetailURL, getExplorerBlockDetailURL };
}
