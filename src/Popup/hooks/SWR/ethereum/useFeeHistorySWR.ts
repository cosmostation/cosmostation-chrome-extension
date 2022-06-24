import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { post } from '~/Popup/utils/axios';
import type { FeeHistoryPayload } from '~/types/ethereum/rpc';

type BlockCount = string | number;
type NewestBlock = string;
type RewardPercentiles = number[];

type BodyParams = [BlockCount, NewestBlock, RewardPercentiles];

type FetchParams = {
  url: string;
  body: {
    method: string;
    params: BodyParams;
  };
};

export function useFeeHistorySWR(bodyParams: BodyParams, config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { rpcURL } = currentEthereumNetwork;

  const fetcher = (params: FetchParams) => post<FeeHistoryPayload>(params.url, { ...params.body, id: 1, jsonrpc: '2.0' });

  const { data, error, mutate } = useSWR<FeeHistoryPayload, AxiosError>({ url: rpcURL, body: { method: 'eth_feeHistory', params: bodyParams } }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 9000,
    refreshInterval: 10000,
    errorRetryCount: 0,
    ...config,
  });

  return { data, error, mutate };
}
