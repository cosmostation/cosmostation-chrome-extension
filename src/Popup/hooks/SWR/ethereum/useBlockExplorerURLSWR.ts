import { useCallback, useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { BLOCK_EXPLORER_PATH } from '~/constants/common';
import { removeTrailSlash } from '~/Popup/utils/fetch';
import type { EthereumNetwork } from '~/types/chain';

import { useParamsSWR } from '../useParamsSWR';

export function useBlockExplorerURLSWR(network: EthereumNetwork, config?: SWRConfiguration) {
  const chainParams = useParamsSWR(network, config);

  const chainlistExplorer = useMemo(
    () => chainParams.data?.params?.chainlist_params?.evm_explorer || chainParams.data?.params?.chainlist_params?.explorer,
    [chainParams.data?.params?.chainlist_params?.evm_explorer, chainParams.data?.params?.chainlist_params?.explorer],
  );

  const getExplorerURL = useCallback(() => removeTrailSlash(chainlistExplorer?.url || network.explorerURL), [chainlistExplorer?.url, network.explorerURL]);

  const getExplorerAccountURL = useCallback(
    (address?: string) => {
      if (!address) return '';

      const explorerAccountURL = chainlistExplorer?.account || network.accountExplorerURL;

      if (explorerAccountURL) {
        return explorerAccountURL.replace(`\${${BLOCK_EXPLORER_PATH.ACCOUNT}}`, address);
      }

      const explorerBaseURL = getExplorerURL();
      return explorerBaseURL ? `${explorerBaseURL}/address/${address}` : '';
    },
    [chainlistExplorer?.account, getExplorerURL, network.accountExplorerURL],
  );

  const getExplorerTxDetailURL = useCallback(
    (txHash?: string) => {
      if (!txHash) return '';

      const explorerTxDetailURL = chainlistExplorer?.tx || network.txDetailExplorerURL;

      if (explorerTxDetailURL) {
        return explorerTxDetailURL?.replace(`\${${BLOCK_EXPLORER_PATH.TX}}`, txHash) || '';
      }

      const explorerBaseURL = getExplorerURL();
      return explorerBaseURL ? `${explorerBaseURL}/tx/${txHash}` : '';
    },
    [chainlistExplorer?.tx, getExplorerURL, network.txDetailExplorerURL],
  );

  const getExplorerBlockDetailURL = useCallback(
    (blockHeight?: string) => {
      if (!blockHeight) return '';

      if (network.blockDetailExplorerURL) {
        return network.blockDetailExplorerURL.replace(`\${${BLOCK_EXPLORER_PATH.BLOCK}}`, blockHeight) || '';
      }

      const explorerBaseURL = getExplorerURL();
      return explorerBaseURL ? `${explorerBaseURL}/block/${blockHeight}` : '';
    },
    [getExplorerURL, network.blockDetailExplorerURL],
  );

  return { getExplorerURL, getExplorerAccountURL, getExplorerTxDetailURL, getExplorerBlockDetailURL };
}
