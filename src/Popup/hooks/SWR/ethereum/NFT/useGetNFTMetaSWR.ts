import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { GetNFTMetaPayload } from '~/types/ethereum/nft';

export function useGetNFTMetaSWR(url?: string, config?: SWRConfiguration) {
  // NOTE need convert ipfs
  const fetcher = (fetchUrl: string) => get<GetNFTMetaPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<GetNFTMetaPayload, AxiosError>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !url,
    ...config,
  });

  return { data, error, mutate };
}
