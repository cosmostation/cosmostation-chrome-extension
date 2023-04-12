import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { JsonRpcProvider, SuiObjectResponseQuery } from '@mysten/sui.js';

type FetchParams = {
  address: string;
  provider?: JsonRpcProvider;
  query?: SuiObjectResponseQuery;
};

type UseOwnedObjectsSWR = {
  address: string;
  provider?: JsonRpcProvider;
  query?: SuiObjectResponseQuery;
};

export function useOwnedObjectsSWR({ address, provider, query }: UseOwnedObjectsSWR, config?: SWRConfiguration) {
  const fetcher = (params: FetchParams) => params.provider?.getOwnedObjects({ owner: params.address, options: { ...params.query?.options } });

  const { data, error, mutate } = useSWR<Awaited<ReturnType<typeof fetcher>>, unknown>({ address, provider, query }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !address,
    ...config,
  });

  return { data, error, mutate };
}
