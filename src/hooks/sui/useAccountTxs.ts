import type { SuiTransactionBlockResponse } from '@mysten/sui/client';

import { isMatchingCoinId } from '@/utils/queryParamGenerator';
import { analyzeTransactions, getHumanReadable } from '@/utils/sui/parseTx';

import { useTransactionBlocks } from './useTransactionBlocks';
import type { UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useAccountAssets } from '../useAccountAssets';

type UseAccountTxsProps = {
  coinId: string;
  config?: UseInfiniteFetchConfig;
};

export function useAccountTxs({ coinId, config }: UseAccountTxsProps) {
  const { data: accountAssets } = useAccountAssets();

  const accountAsset = accountAssets?.suiAccountAssets?.find((asset) => isMatchingCoinId(asset.asset, coinId));

  const address = accountAsset?.address.address || '';

  const {
    data: fromTxBlocks,
    fetchNextPage: fetchFromNextPage,
    isFetchingNextPage: isFetchingFromNextPage,
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
    fetchNextPage: fetchToNextPage,
    isFetchingNextPage: isFetchingToNextPage,
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

  const flattenedFromTxBlocks = (fromTxBlocks?.pages.flatMap((page) => page?.result?.data).filter((tx) => !!tx) as SuiTransactionBlockResponse[]) ?? [];
  const flattenedToTxBlocks = (toTxBlocks?.pages.flatMap((page) => page?.result?.data).filter((tx) => !!tx) as SuiTransactionBlockResponse[]) ?? [];

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

  return { formattedTxBlocks, fetchNextPage, isFetchingNextPage, hasNextPage, isPending };
}
