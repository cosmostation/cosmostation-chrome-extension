import { IotaClient } from '@iota/iota-sdk/client';
import { Transaction } from '@iota/iota-sdk/transactions';
import { toB64 } from '@iota/iota-sdk/utils';

import type { IotaDryRunTransactionBlockResponse } from '@/types/iota/api';
import { isAxiosError, post } from '@/utils/axios';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseDryRunTransactionProps = {
  coinId: string;
  transaction?: Transaction | string | Uint8Array;
  config?: UseFetchConfig;
};

export function useDryRunTransaction({ coinId, transaction, config }: UseDryRunTransactionProps) {
  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });

  const accountAsset = getIotaAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const txObject = (() => {
    if (!transaction) return null;

    const originTransaction = typeof transaction === 'string' || transaction instanceof Uint8Array ? Transaction.from(transaction) : transaction;

    return originTransaction.getData();
  })();

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      if (!transaction) {
        return null;
      }

      const client = new IotaClient({ url: requestURL });

      const originTransaction = typeof transaction === 'string' || transaction instanceof Uint8Array ? Transaction.from(transaction) : transaction;

      const buildedTransaction = await originTransaction.build({ client });

      const response = await post<IotaDryRunTransactionBlockResponse>(requestURL, {
        jsonrpc: '2.0',
        method: 'iota_dryRunTransactionBlock',
        params: [toB64(buildedTransaction)],
        id: toB64(buildedTransaction),
      });

      if (response.error) {
        throw new Error(`[RPC Error] URL: ${requestURL}, Method: iota_dryRunTransactionBlock, Message: ${response.error?.message}`);
      }

      return response;
    } catch (e) {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }

      return fetcher(index + 1);
    }
  };

  const { data, isLoading, isFetching, error } = useFetch({
    queryKey: ['useIotaDryRunTransactionBlock', coinId, txObject, transaction],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length && !!transaction,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error };
}
