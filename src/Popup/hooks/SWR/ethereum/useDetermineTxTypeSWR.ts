import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import type { DetermineTxType } from '~/Popup/utils/ethereum';
import { determineTxType } from '~/Popup/utils/ethereum';
import type { EthereumChain } from '~/types/chain';
import type { EthereumTx } from '~/types/message/ethereum';

import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';

export function useDetermineTxTypeSWR(tx: EthereumTx, config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const fetcher = (params: { ethereumChain: EthereumChain; ethereumTx: EthereumTx }) => determineTxType(params.ethereumTx, currentEthereumNetwork.rpcURL);

  const { data, mutate } = useSWR<DetermineTxType>({ ethereumTx: tx }, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
    errorRetryCount: 0,
    ...config,
  });

  return { data, mutate };
}
