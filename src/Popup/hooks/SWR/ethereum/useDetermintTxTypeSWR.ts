import useSWR from 'swr';

import { determineTxType } from '~/Popup/background/ethereum';
import type { EthereumChain } from '~/types/chain';
import type { EthereumTx } from '~/types/ethereum/message';

export function useDetermintTxTypeSWR(chain: EthereumChain, tx: EthereumTx, suspense?: boolean) {
  const fetcher = (params: { ethereumChain: EthereumChain; ethereumTx: EthereumTx }) => determineTxType(params.ethereumChain, params.ethereumTx);

  const { data, mutate } = useSWR({ ethereumChain: chain, ethereumTx: tx }, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
    errorRetryCount: 0,
    suspense,
  });

  return { data, mutate };
}
