import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { post } from '~/Popup/utils/axios';
import { ethereumAddressRegex } from '~/Popup/utils/regex';
import type { EstimateGasPayload } from '~/types/ethereum/rpc';

type Tx = { from: string; to: string; data?: string; value?: string };

type BodyParams = [Tx];

type FetchParams = {
  url: string;
  body: {
    method: string;
    params: BodyParams;
  };
};

export function useEstimateGasSWR(bodyParams: BodyParams, config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { rpcURL } = currentEthereumNetwork;

  const fetcher = (params: FetchParams) => post<EstimateGasPayload>(params.url, { ...params.body, id: 1, jsonrpc: '2.0' });

  const { data, error, mutate } = useSWR<EstimateGasPayload, AxiosError>({ url: rpcURL, body: { method: 'eth_estimateGas', params: bodyParams } }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 9000,
    refreshInterval: 10000,
    errorRetryCount: 0,
    isPaused: () => !ethereumAddressRegex.test(bodyParams[0].to) || !ethereumAddressRegex.test(bodyParams[0].from),
    ...config,
  });

  return { data, error, mutate };
}
