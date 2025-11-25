import { useMemo } from 'react';
import { isHexString, type TransactionReceipt } from 'ethers';

import { waitForTransaction } from '@/utils/ethereum/waitForTx';

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

  const accountAsset = getEVMAccountAsset();

  const rpcURLs = useMemo(() => accountAsset?.chain.rpcUrls.map((item) => item.url) || [], [accountAsset?.chain.rpcUrls]);
  const evmChainId = useMemo(
    () => (accountAsset?.chain.chainId && isHexString(accountAsset.chain.chainId) ? parseInt(accountAsset.chain.chainId, 16) : undefined),
    [accountAsset?.chain.chainId],
  );

  const fetchResult = useFetch<EthersTxResult>({
    queryKey: ['useTxInfo', coinId, txHash],
    fetchFunction: () => waitForTransaction({ txHash, rpcURLs, chainId: evmChainId }),
    config: {
      enabled: !!coinId && !!txHash && !!rpcURLs.length,
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
