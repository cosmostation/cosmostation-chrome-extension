import { useState } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { post } from '~/Popup/utils/axios';
import type { BlockInfoByHashPayload } from '~/types/ethereum/rpc';

type FetchParams = {
  url: string;
  body: {
    method: string;
    params: [];
  };
};

export function useBlockInfoByHashSWR(blockHash?: string, config?: SWRConfiguration) {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { rpcURL } = currentEthereumNetwork;

  const fetcher = (params: FetchParams) => post<BlockInfoByHashPayload>(params.url, { ...params.body, id: 1, jsonrpc: '2.0' });

  const { data, isValidating, error, mutate } = useSWR<BlockInfoByHashPayload, AxiosError>(
    { url: rpcURL, body: { method: 'eth_getBlockByHash', params: [blockHash, false] } },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      onErrorRetry: (_, __, ___, revalidate, { retryCount }) => {
        if (retryCount >= 11) return;

        if (retryCount === 10) {
          setHasTimedOut(true);
        }
        setTimeout(() => {
          void revalidate({ retryCount });
        }, 5000);
      },
      isPaused: () => !blockHash || !rpcURL,
      ...config,
    },
  );

  return { data, isValidating, error, hasTimedOut, mutate };
}
