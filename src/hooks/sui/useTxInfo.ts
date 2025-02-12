import type { SuiTransactionBlockResponseOptions } from '@mysten/sui/client';

import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '@/constants/error';
import type { SuiTxInfoResponse } from '@/types/sui/api';
import { isAxiosError, post } from '@/utils/axios';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useAccountAssets } from '../useAccountAssets';

type UseTxInfoProps = {
  coinId: string;
  digest?: string;
  queryOptions?: SuiTransactionBlockResponseOptions;
  config?: UseFetchConfig;
};

export function useTxInfo({ coinId, digest, queryOptions, config }: UseTxInfoProps) {
  const { data: accountAssets } = useAccountAssets();

  const accountAsset = accountAssets?.suiAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const requestBody = {
        jsonrpc: '2.0',
        method: 'sui_getTransactionBlock',
        params: [
          digest,
          {
            showInput: false,
            showRawInput: false,
            showEffects: true,
            showEvents: true,
            showObjectChanges: false,
            showBalanceChanges: false,
            ...queryOptions,
          },
        ],
        id: digest,
      };

      const respose = await post<SuiTxInfoResponse>(requestURL, requestBody, {
        timeout: 5000,
      });

      if (respose.error) {
        throw new Error(respose.error.message);
      }

      if (!respose.result?.checkpoint) {
        throw new Error(TRASACTION_RECEIPT_ERROR_MESSAGE.PENDING);
      }

      return respose;
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

  const { data, error, isFetching, isLoading, status, isPending } = useFetch<SuiTxInfoResponse | null>({
    queryKey: ['useTxInfo', digest, coinId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!coinId && !!digest && !!rpcURLs.length,
      retry: (failureCount, error) => {
        if (isAxiosError(error)) {
          if (error.response?.status === 404) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: 1000 * 5,
      ...config,
    },
  });

  return { data, error, isFetching, isLoading, status, isPending };
}
