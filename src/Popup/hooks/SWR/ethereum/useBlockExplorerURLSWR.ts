import { useCallback, useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

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

      return explorerAccountURL?.replace(`\${address}`, address) || '';
    },
    [chainlistExplorer?.account, network.accountExplorerURL],
  );

  const getExplorerTxDetailURL = useCallback(
    (txHash?: string) => {
      if (!txHash) return '';

      const explorerTxDetailURL = chainlistExplorer?.tx || network.txDetailExplorerURL;

      return explorerTxDetailURL?.replace(`\${hash}`, txHash) || '';
    },
    [chainlistExplorer?.tx, network.txDetailExplorerURL],
  );

  const getExplorerBlockDetailURL = useCallback(
    (blockHeight?: string) => {
      if (!blockHeight) return '';

      return network.blockDetailExplorerURL?.replace(`\${blockHeight}`, blockHeight) || '';
    },
    [network.blockDetailExplorerURL],
  );

  return { getExplorerURL, getExplorerAccountURL, getExplorerTxDetailURL, getExplorerBlockDetailURL };
}
