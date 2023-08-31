import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { cosmosTxHashRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { TxInfoPayload } from '~/types/cosmos/tx';

export function useTxInfoSWR(chain: CosmosChain, txHash: string, config?: SWRConfiguration) {
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
    errorRetryCount: 10,
    ...config,
    isPaused: () => !txHash || !chain,
  });

  return { data, isValidating, error, mutate };
}
