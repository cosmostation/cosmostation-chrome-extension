import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { TxInfoPayload } from '~/types/cosmos/tx';

export function useTxInfoSWR(chain: CosmosChain, txHash: string, suspense?: boolean) {
  const { getTxInfo } = cosmosURL(chain);

  const requestURL = getTxInfo(txHash);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<TxInfoPayload>(fetchUrl);
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, error, mutate } = useSWR<TxInfoPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    suspense,
    isPaused: () => !txHash || !chain,
  });

  return { data, error, mutate };
}
