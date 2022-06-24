import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { post } from '~/Popup/utils/axios';
import type { TransactionCountPayload } from '~/types/ethereum/rpc';

type BodyParams = [string, string];

type FetchParams = {
  url: string;
  body: {
    method: string;
    params: BodyParams;
  };
};

export function useTransactionCountSWR(bodyParams: BodyParams, config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { rpcURL } = currentEthereumNetwork;

  const fetcher = (params: FetchParams) => post<TransactionCountPayload>(params.url, { ...params.body, id: 1, jsonrpc: '2.0' });

  const { data, error, mutate } = useSWR<TransactionCountPayload, AxiosError>(
    { url: rpcURL, body: { method: 'eth_getTransactionCount', params: bodyParams } },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 19000,
      refreshInterval: 20000,
      errorRetryCount: 0,
      ...config,
    },
  );

  return { data, error, mutate };
}
