import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { FeemarketPayload } from '~/types/cosmos/feemarket';

type UseFeemarketSWRProps = {
  chain: CosmosChain;
  denom?: string;
};

export function useFeemarketSWR({ chain, denom }: UseFeemarketSWRProps, config?: SWRConfiguration) {
  const { getFeemarket } = cosmosURL(chain);

  const requestURL = getFeemarket(denom);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<FeemarketPayload>(fetchUrl);
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        if (e.response?.status === 501) {
          throw e;
        }
      }
      return null;
    }
  };

  const { data, error, mutate } = useSWR<FeemarketPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    ...config,
    isPaused: () => !chain,
  });

  return { data, error, mutate };
}
