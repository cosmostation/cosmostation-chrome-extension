import type { IotaTransactionBlockResponse } from '@iota/iota-sdk/client';

import { analyzeTransactions, getHumanReadable } from '@/utils/iota/parseTx';

import { useTransactionBlocks } from './useTransactionBlocks';
import type { UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseAccountTxsProps = {
  coinId: string;
  config?: UseInfiniteFetchConfig;
};

export function useAccountTxs({ coinId, config }: UseAccountTxsProps) {
  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });
  const accountAsset = getIotaAccountAsset();

  const address = accountAsset?.address.address || '';

  const {
    data: fromTxBlocks,
    error: fromError,
    fetchNextPage: fetchFromNextPage,
    isFetchingNextPage: isFetchingFromNextPage,
    isLoading: isFromLoading,
    hasNextPage: hasFromNextPage,
    isPending: isFromPending,
  } = useTransactionBlocks({
    coinId,
    queryOptions: { filter: { FromAddress: address } },
    config: {
      ...config,
      enabled: !!address,
    },
  });

  const {
    data: toTxBlocks,
    error: toError,
    fetchNextPage: fetchToNextPage,
    isFetchingNextPage: isFetchingToNextPage,
    isLoading: isToLoading,
    hasNextPage: hasToNextPage,
    isPending: isToPending,
  } = useTransactionBlocks({
    coinId,
    queryOptions: { filter: { ToAddress: address } },
    config: {
      ...config,
      enabled: !!address,
    },
  });

  const fetchNextPage = () => {
    if (hasFromNextPage) {
      fetchFromNextPage();
    }

    if (hasToNextPage) {
      fetchToNextPage();
    }
  };

  const isFetchingNextPage = isFetchingFromNextPage || isFetchingToNextPage;

  const hasNextPage = hasFromNextPage || hasToNextPage;

  const isPending = isFromPending || isToPending;

  const isLoading = isFromLoading || isToLoading;

  const error = fromError || toError;

  const flattenedFromTxBlocks = (fromTxBlocks?.pages.flatMap((page) => page?.result?.data).filter((tx) => !!tx) as IotaTransactionBlockResponse[]) ?? [];
  const flattenedToTxBlocks = (toTxBlocks?.pages.flatMap((page) => page?.result?.data).filter((tx) => !!tx) as IotaTransactionBlockResponse[]) ?? [];

  const uniqueTxBlocks = [...flattenedFromTxBlocks, ...flattenedToTxBlocks]
    .filter((value, index, self) => self.findIndex((tx) => tx.digest === value.digest) === index)
    .sort((a, b) => Number(b.timestampMs ?? '0') - Number(a.timestampMs || '0'));

  const analyzedTxBlock = analyzeTransactions(address, uniqueTxBlocks);

  const formattedTxBlocks = analyzedTxBlock.map((analyzedTransaction) => {
    const humanReadable = getHumanReadable(analyzedTransaction);
    return {
      analyzedTransaction: analyzedTransaction,
      humanReadable: humanReadable,
    };
  });

  return { formattedTxBlocks, error, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading, isPending };
}
