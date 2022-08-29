import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { post } from '~/Popup/utils/axios';
import type { NetVersionPayload } from '~/types/ethereum/rpc';

type FetchParams = {
  url: string;
  body: {
    method: string;
  };
};

export function useNetVersionSWR(config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { rpcURL } = currentEthereumNetwork;

  const fetcher = (params: FetchParams) => post<NetVersionPayload>(params.url, { ...params.body, id: 1, jsonrpc: '2.0' });

  const { data, error, mutate } = useSWR<NetVersionPayload, AxiosError>({ url: rpcURL, body: { method: 'net_version' } }, fetcher, {
    revalidateOnFocus: false,
    errorRetryCount: 0,
    ...config,
  });

  return { data, error, mutate };
}
