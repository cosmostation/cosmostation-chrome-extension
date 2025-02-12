import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';

import type { SuiDryRunTransactionBlockResponse } from '@/types/sui/api';
import { isAxiosError, post } from '@/utils/axios';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useAccountAssets } from '../useAccountAssets';

type UseDryRunTransactionProps = {
  coinId: string;
  transaction?: Transaction | string | Uint8Array;
  config?: UseFetchConfig;
};

export function useDryRunTransaction({ coinId, transaction, config }: UseDryRunTransactionProps) {
  const { data: accountAssets } = useAccountAssets();

  const accountAsset = accountAssets?.suiAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

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

      const client = new SuiClient({ url: requestURL });

      const originTransaction = typeof transaction === 'string' || transaction instanceof Uint8Array ? Transaction.from(transaction) : transaction;

      const buildedTransaction = await originTransaction.build({ client });

      return await post<SuiDryRunTransactionBlockResponse>(requestURL, {
        jsonrpc: '2.0',
        method: 'sui_dryRunTransactionBlock',
        params: [toBase64(buildedTransaction)],
        id: toBase64(buildedTransaction),
      });
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

  const { data, isLoading, error } = useFetch({
    queryKey: ['useDryRunTransactionBlock', coinId, txObject, transaction],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!rpcURLs.length && !!transaction,
      ...config,
    },
  });

  return { data, isLoading, error };
}
