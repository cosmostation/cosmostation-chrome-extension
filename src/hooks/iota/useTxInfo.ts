import type { IotaTransactionBlockResponseOptions } from '@iota/iota-sdk/client';

import { TRASACTION_RECEIPT_ERROR_MESSAGE } from '@/constants/error';
import type { IotaTxInfoResponse } from '@/types/iota/api';
import { isAxiosError, post } from '@/utils/axios';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseTxInfoProps = {
  coinId: string;
  digest?: string;
  queryOptions?: IotaTransactionBlockResponseOptions;
  config?: UseFetchConfig;
};

export function useTxInfo({ coinId, digest, queryOptions, config }: UseTxInfoProps) {
  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });

  const accountAsset = getIotaAccountAsset();

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const requestURL = rpcURLs[index];

      const requestBody = {
        jsonrpc: '2.0',
        method: 'iota_getTransactionBlock',
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

      const respose = await post<IotaTxInfoResponse>(requestURL, requestBody, {
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

  const { data, error, isFetching, isLoading, status, isPending } = useFetch<IotaTxInfoResponse | null>({
    queryKey: ['useIotaTxInfo', digest, coinId],
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
