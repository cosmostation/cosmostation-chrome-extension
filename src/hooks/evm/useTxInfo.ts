import { useCallback, useEffect, useState } from 'react';
import type { TransactionReceipt } from 'ethers';
import { ethers, isError } from 'ethers';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseTxInfoProps = {
  coinId: string;
  txHash?: string;
  config?: UseFetchConfig;
};

export type EthersTxStatus = 'pending' | 'success' | 'failed' | 'timeout' | 'not_found' | 'invalid';

export type EthersTxResult = {
  status: EthersTxStatus;
  receipt?: TransactionReceipt;
  error?: string;
  blockHash?: string;
};

export function useTxInfo({ coinId, txHash, config }: UseTxInfoProps) {
  const { getEVMAccountAsset } = useGetAccountAsset({ coinId });
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | ethers.FallbackProvider | null>(null);

  const accountAsset = getEVMAccountAsset();

  useEffect(() => {
    const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];
    if (rpcURLs.length > 0) {
      const fallbackConfig = {
        staticNetwork: true,
        batchMaxCount: 1,
      };

      const providers = rpcURLs.map((url) => new ethers.JsonRpcProvider(url, undefined, fallbackConfig));

      if (providers.length > 1) {
        const fallbackProvider = new ethers.FallbackProvider(
          providers.map((provider, index) => ({
            provider,
            priority: index + 1,
            weight: 1,
          })),
        );
        setProvider(fallbackProvider);
      } else {
        setProvider(providers[0]);
      }
    } else {
      setProvider(null);
    }
  }, [accountAsset?.chain.rpcUrls]);

  const waitForTransaction = useCallback(async (): Promise<EthersTxResult> => {
    if (!provider) {
      return {
        status: 'invalid',
        error: 'No provider available',
      };
    }

    if (!txHash || !ethers.isHexString(txHash, 32)) {
      return {
        status: 'invalid',
        error: 'Invalid transaction hash',
      };
    }

    try {
      const confirmationsNeeded = 1;
      const timeout = 60000;

      const receipt = await provider.waitForTransaction(txHash, confirmationsNeeded, timeout);

      if (!receipt) {
        return {
          status: 'timeout',
          error: 'Transaction timeout',
        };
      }

      const status: EthersTxStatus = receipt.status === 1 ? 'success' : 'failed';

      return {
        status,
        receipt,
        blockHash: receipt.blockHash,
        error: status === 'failed' ? 'Transaction failed' : undefined,
      };
    } catch (error) {
      if (isError(error, 'TIMEOUT')) {
        return {
          status: 'timeout',
          error: 'Transaction timeout',
        };
      }

      if (isError(error, 'NETWORK_ERROR')) {
        return {
          status: 'timeout',
          error: 'Network connection failed',
        };
      }

      if (isError(error, 'SERVER_ERROR')) {
        return {
          status: 'timeout',
          error: 'RPC server error',
        };
      }

      if (isError(error, 'TRANSACTION_REPLACED')) {
        return {
          status: 'failed',
          error: 'Transaction was replaced or cancelled',
        };
      }

      return {
        status: 'not_found',
        error: 'Transaction not found',
      };
    } finally {
      provider.destroy();
    }
  }, [provider, txHash]);

  const fetchResult = useFetch<EthersTxResult>({
    queryKey: ['useTxInfo', coinId, txHash],
    fetchFunction: waitForTransaction,
    config: {
      enabled: !!coinId && !!txHash && !!provider,
      refetchInterval: (query) => {
        return query.state.data?.status === 'pending' ? 5000 : false;
      },
      ...config,
    },
  });

  const { data, error, isFetching, isLoading, status, isPending } = fetchResult;

  return {
    data,
    error,
    isFetching,
    isLoading,
    status,
    isPending,

    isTxSuccess: data?.status === 'success',
    isTxFailed: data?.status === 'failed',
    isTxPending: data?.status === 'pending',
    isTxTimeout: data?.status === 'timeout',
    isTxNotFound: data?.status === 'not_found',
  };
}
