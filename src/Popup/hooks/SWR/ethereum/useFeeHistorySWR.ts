import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
import { post } from '~/Popup/utils/axios';
import type { EthereumChain } from '~/types/chain';
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

export function useFeeHistorySWR(chain: EthereumChain, bodyParams: BodyParams, suspense?: boolean) {
  const { currentNetwork } = useCurrentNetwork(chain);

  const { rpcURL } = currentNetwork;

  const fetcher = (params: FetchParams) => post<FeeHistoryPayload>(params.url, { ...params.body, id: 1, jsonrpc: '2.0' });

  const { data, error, mutate } = useSWR<FeeHistoryPayload, AxiosError>({ url: rpcURL, body: { method: 'eth_feeHistory', params: bodyParams } }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 9000,
    refreshInterval: 10000,
    errorRetryCount: 0,
    suspense,
  });

  return { data, error, mutate };
}