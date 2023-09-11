import { useState } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { cosmosTxHashRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { TxInfoPayload } from '~/types/cosmos/tx';

export function useTxInfoSWR(chain: CosmosChain, txHash: string, config?: SWRConfiguration) {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const { getTxInfo } = cosmosURL(chain);

  const requestURL = getTxInfo(txHash);

  const fetcher = (fetchUrl: string) => {
    if (!cosmosTxHashRegex.test(txHash)) {
      return null;
    }
    return get<TxInfoPayload>(fetchUrl);
  };

  const { data, isValidating, error, mutate } = useSWR<TxInfoPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    onErrorRetry: (_, __, ___, revalidate, { retryCount }) => {
      if (retryCount >= 11) return;

      if (retryCount === 10) {
        setHasTimedOut(true);
      }
      setTimeout(() => {
        void revalidate({ retryCount });
      }, 5000);
    },
    isPaused: () => !txHash || !chain,
    ...config,
  });

  return { data, isValidating, error, hasTimedOut, mutate };
}
