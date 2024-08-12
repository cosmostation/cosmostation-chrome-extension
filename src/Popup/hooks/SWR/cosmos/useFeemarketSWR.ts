import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { FeemarketPayload } from '~/types/cosmos/feemarket';

import { useParamsSWR } from './useParamsSWR';

type UseFeemarketSWRProps = {
  chain: CosmosChain;
  denom?: string;
};

type FetcherParams = {
  isFetchAllowed: boolean;
  fetchUrl: string;
};

export function useFeemarketSWR({ chain, denom }: UseFeemarketSWRProps, config?: SWRConfiguration) {
  const chainListParams = useParamsSWR(chain, config);

  const isEnabledFeemarket = useMemo(
    () => chainListParams.data?.params?.chainlist_params?.fee?.feemarket,
    [chainListParams.data?.params?.chainlist_params?.fee?.feemarket],
  );

  const { getFeemarket } = cosmosURL(chain);

  const requestURL = getFeemarket(denom);

  const fetcher = async ({ isFetchAllowed, fetchUrl }: FetcherParams) => {
    try {
      if (isFetchAllowed) {
        return await get<FeemarketPayload>(fetchUrl);
      }

      return null;
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<FeemarketPayload | null, AxiosError>(
    {
      isFetchAllowed: isEnabledFeemarket,
      fetchUrl: requestURL,
    },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      ...config,
      isPaused: () => !chain,
    },
  );

  return { data, error, mutate };
}
