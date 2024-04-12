import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import { isHexString } from 'ethereumjs-util';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ONEINCH_SWAP_BASE_URL } from '~/constants/1inch';
import { get } from '~/Popup/utils/axios';
import type { Assets } from '~/types/1inch/swap';

export function useOneInchTokensSWR(chainId?: string, config?: SWRConfiguration) {
  const parsedChainId = useMemo(() => chainId && (isHexString(chainId) ? String(parseInt(chainId, 16)) : chainId), [chainId]);

  const requestURL = useMemo(() => `${ONEINCH_SWAP_BASE_URL}/${parsedChainId || ''}/tokens`, [parsedChainId]);

  const fetcher = (fetchUrl: string) => get<Assets>(fetchUrl, { headers: { Authorization: `Bearer ${String(process.env.ONEINCH_API_KEY)}` } });

  const { data, error, mutate } = useSWR<Assets, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !parsedChainId,
    ...config,
  });

  return { data, error, mutate };
}
