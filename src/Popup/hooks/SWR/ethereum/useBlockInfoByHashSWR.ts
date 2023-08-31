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
      errorRetryCount: 10,
      ...config,
      isPaused: () => !blockHash || !rpcURL,
    },
  );

  return { data, isValidating, error, mutate };
}
