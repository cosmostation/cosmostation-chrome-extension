import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { post } from '~/Popup/utils/axios';
import type { Estimatesmartfee } from '~/types/bitcoin/balance';
import type { BitcoinChain } from '~/types/chain';

type FetchParams = {
  url: string;
};

export function useEstimatesmartfeeSWR(chain: BitcoinChain, config?: SWRConfiguration) {
  const { rpcURL } = chain;
  const fetcher = (params: FetchParams) => {
    const { url } = params;
    return post<Estimatesmartfee>(url, { method: 'estimatesmartfee', params: [2], id: 1, jsonrpc: '2.0' });
  };

  const { data, error, mutate } = useSWR<Estimatesmartfee, AxiosError>({ url: rpcURL }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 9000,
    refreshInterval: 10000,
    ...config,
  });

  return { data, error, mutate };
}
