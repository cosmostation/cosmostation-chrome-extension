import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { JsonRpcProvider } from '@mysten/sui.js';

type Options = {
  showType?: boolean;
  showContent?: boolean;
  showBcs?: boolean;
  showOwner?: boolean;
  showPreviousTransaction?: boolean;
  showStorageRebate?: boolean;
  showDisplay?: boolean;
};

type FetchParams = {
  objectIds: string[];
  provider?: JsonRpcProvider;
  options?: Options;
};

type UseObjectsSWR = {
  objectIds: string[];
  provider?: JsonRpcProvider;
  options?: Options;
};

export function useObjectsSWR({ objectIds, provider, options }: UseObjectsSWR, config?: SWRConfiguration) {
  const fetcher = (params: FetchParams) =>
    params.provider?.multiGetObjects({
      ids: [...params.objectIds],
      options: {
        ...params.options,
      },
    });

  const { data, error, mutate } = useSWR<Awaited<ReturnType<typeof fetcher>>, unknown>({ objectIds, provider, options }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !objectIds || !provider,
    ...config,
  });

  return { data, error, mutate };
}
