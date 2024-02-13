import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { Block } from '~/types/cosmos/block';

import { useCurrentChain } from '../../useCurrent/useCurrentChain';

type FetcherParams = {
  cosmosChain: CosmosChain;
  fetchUrl: string;
};

export function useBlockLatestSWR(chain?: CosmosChain, suspense?: boolean) {
  const { currentChain } = useCurrentChain();

  const currentCosmosChain = useMemo(() => chain || (currentChain.line === 'COSMOS' ? currentChain : COSMOS), [chain, currentChain]);

  const { getBlockLatest } = cosmosURL(currentCosmosChain);

  const requestURL = getBlockLatest();

  const fetcher = async ({ cosmosChain, fetchUrl }: FetcherParams) => {
    try {
      if (!cosmosChain) {
        return null;
      }

      return await get<Block>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<Block | null, AxiosError>(
    {
      cosmosChain: currentCosmosChain,
      fetchUrl: requestURL,
    },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      suspense,
    },
  );

  return { data, error, mutate };
}
