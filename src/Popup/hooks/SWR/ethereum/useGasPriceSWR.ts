import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
import { post } from '~/Popup/utils/axios';
import type { EthereumChain } from '~/types/chain';
import type { GasPricePayload } from '~/types/ethereum/rpc';

type FetchParams = {
  url: string;
  body: {
    method: string;
    params: [];
  };
};

export function useGasPriceSWR(chain: EthereumChain, suspense?: boolean) {
  const { currentNetwork } = useCurrentNetwork(chain);

  const { rpcURL } = currentNetwork;

  const fetcher = (params: FetchParams) => post<GasPricePayload>(params.url, { ...params.body, id: 1, jsonrpc: '2.0' });

  const { data, error, mutate } = useSWR<GasPricePayload, AxiosError>({ url: rpcURL, body: { method: 'eth_gasPrice', params: [] } }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 9000,
    refreshInterval: 10000,
    errorRetryCount: 0,
    suspense,
  });

  return { data, error, mutate };
}