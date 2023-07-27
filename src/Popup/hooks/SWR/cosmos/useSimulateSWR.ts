import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { post } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { SimulatePayload } from '~/types/cosmos/simulate';

type FetchProps = {
  fetchUrl: string;
  tx?: string;
};

type UseSimulateSWRProps = {
  chain: CosmosChain;
  txBytes?: string;
};

export function useSimulateSWR({ chain, txBytes }: UseSimulateSWRProps, config?: SWRConfiguration) {
  const { simulate } = cosmosURL(chain);

  const requestURL = simulate();

  const fetcher = async ({ fetchUrl, tx }: FetchProps) => {
    try {
      return await post<SimulatePayload>(fetchUrl, { txBytes: tx });
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<SimulatePayload | null, AxiosError>({ fetchUrl: requestURL, tx: txBytes }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !txBytes || !requestURL || !chain,
    ...config,
  });

  return {
    data,
    error,
    mutate,
  };
}
