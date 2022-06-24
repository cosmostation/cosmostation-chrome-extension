import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import type { DetermineTxType } from '~/Popup/utils/ethereum';
import { determineTxType } from '~/Popup/utils/ethereum';
import type { EthereumChain } from '~/types/chain';
import type { EthereumTx } from '~/types/ethereum/message';

export function useDetermintTxTypeSWR(tx: EthereumTx, config?: SWRConfiguration) {
  const fetcher = (params: { ethereumChain: EthereumChain; ethereumTx: EthereumTx }) => determineTxType(params.ethereumTx);

  const { data, mutate } = useSWR<DetermineTxType>({ ethereumTx: tx }, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
    errorRetryCount: 0,
    ...config,
  });

  return { data, mutate };
}
