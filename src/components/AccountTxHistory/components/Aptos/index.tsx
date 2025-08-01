import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isPendingTransactionResponse } from '@aptos-labs/ts-sdk';
import { useVirtualizer } from '@tanstack/react-virtual';

import Base1300Text from '@/components/common/Base1300Text';
import EmptyAsset from '@/components/EmptyAsset';
import ListLoading from '@/components/Loading/ListLoading';
import { useScaffoldRef } from '@/components/Wrapper/components/Scaffold/components/AppLayout';
import { useGetAccountTransactions } from '@/hooks/aptos/useGetAccountTransactions';
import { formatAptosTxTimestamp, getTimestamp } from '@/utils/aptos/tx';
import { sortByLatestDate } from '@/utils/date';

import AptosPendingTxItem from './components/AptosPendingTxItem';
import AptosTxItem from './components/AptosTxItem';
import {
  Container,
  ContentsContainer,
  DateLineContainer,
  EmptyAssetContainer,
  IconContainer,
  StyledCircularProgress,
  StyledCircularProgressContainer,
  TxDetailContainer,
} from './styled';
import DateLine from '../Common/DateLine';

import ExplorerIcon from '@/assets/images/icons/Explorer14.svg';
import NoSearchIcon from '@/assets/images/icons/NoSearch70.svg';

type AptosAccountTxHistory = {
  coinId: string;
};

export default function AptosAccountTxHistory({ coinId }: AptosAccountTxHistory) {
  const { t } = useTranslation();

  const scaffoldRef = useScaffoldRef();

  const {
    accountAsset: selectedAsset,
    data: accountTxData,
    error,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
  } = useGetAccountTransactions({
    coinId: coinId,
  });

  const accountExplorerUrl = selectedAsset?.chain.explorer.account
    ? selectedAsset.chain.explorer.account.replace('${address}', selectedAsset.address.address)
    : '';

  const flattenedTxs = useMemo(() => accountTxData?.pages?.flatMap((item) => item).filter((item) => !!item) || [], [accountTxData?.pages]);

  const pendingTxs = useMemo(() => flattenedTxs.filter((tx) => !!isPendingTransactionResponse(tx)), [flattenedTxs]);

  const txsGroupedByDate = useMemo(() => {
    const groupedByDate: Record<string, typeof flattenedTxs> = {};

    const sortedByDate = [...flattenedTxs].sort((a, b) => sortByLatestDate(getTimestamp(a), getTimestamp(b)));

    for (const tx of sortedByDate) {
      if (isPendingTransactionResponse(tx)) continue;

      const formattedDate = formatAptosTxTimestamp(tx);
      if (!formattedDate) continue;

      if (!groupedByDate[formattedDate]) {
        groupedByDate[formattedDate] = [];
      }
      groupedByDate[formattedDate].push(tx);
    }

    return Object.entries(groupedByDate).map(([date, txs]) => ({
      [date]: txs,
    }));
  }, [flattenedTxs]);

  const isExistTxHistory = !!txsGroupedByDate.length || !!pendingTxs.length;

  const addtionalLength = pendingTxs.length > 0 ? 1 : 0;

  const virtualizer = useVirtualizer({
    count: hasNextPage ? txsGroupedByDate.length + 1 + addtionalLength : txsGroupedByDate.length + addtionalLength,
    getScrollElement: () => scaffoldRef.current,
    estimateSize: () => 60,
    overscan: 10,
    scrollMargin: scaffoldRef.current?.offsetTop ?? 0,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= txsGroupedByDate.length + addtionalLength - 1 && hasNextPage && !isFetchingNextPage && !error) {
      fetchNextPage();
    }
  }, [addtionalLength, error, fetchNextPage, hasNextPage, isFetchingNextPage, txsGroupedByDate.length, virtualizer]);

  return (
    <Container>
      {isExistTxHistory ? (
        <ContentsContainer>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
              }}
            >
              {virtualItems.map((virtualItem) => {
                const isAdditonalRow = virtualItem.index < addtionalLength;
                const isLoaderRow = hasNextPage && virtualItem.index === txsGroupedByDate.length + addtionalLength;

                const renderItem = isAdditonalRow ? null : txsGroupedByDate[virtualItem.index - 1];

                const date = renderItem ? Object.keys(renderItem)[0] : null;
                const txsByDate = renderItem && date ? renderItem[date] : null;

                return (
                  <div key={virtualItem.key} data-index={virtualItem.index} ref={virtualizer.measureElement}>
                    {isLoaderRow ? (
                      <StyledCircularProgressContainer>
                        <StyledCircularProgress size={20} />
                      </StyledCircularProgressContainer>
                    ) : isAdditonalRow ? (
                      <ContentsContainer>
                        <DateLineContainer>
                          <DateLine date={'Mempool'} hideCalendarIcon />
                        </DateLineContainer>
                        <TxDetailContainer>{pendingTxs.map((tx) => tx && <AptosPendingTxItem key={tx.hash} coinId={coinId} tx={tx} />)}</TxDetailContainer>
                      </ContentsContainer>
                    ) : date && txsByDate ? (
                      <ContentsContainer key={date}>
                        <DateLineContainer>
                          <DateLine date={date} />
                        </DateLineContainer>
                        <TxDetailContainer>{txsByDate.map((tx) => tx && <AptosTxItem key={tx.hash} coinId={coinId} tx={tx} />)}</TxDetailContainer>
                      </ContentsContainer>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </ContentsContainer>
      ) : (
        <EmptyAssetContainer>
          {isLoading ? (
            <ListLoading
              title={t('components.AccountTxHistory.components.Aptos.index.LoadingTitle')}
              subTitle={t('components.AccountTxHistory.components.Aptos.index.LoadingSubTitle')}
            />
          ) : (
            <>
              <EmptyAsset
                icon={<NoSearchIcon />}
                title={t('components.AccountTxHistory.components.Aptos.index.NoHistoryTitle')}
                subTitle={t('components.AccountTxHistory.components.Aptos.index.NoHistorySubTitle')}
                chipButtonProps={
                  accountExplorerUrl
                    ? {
                        onClick: () => {
                          window.open(accountExplorerUrl, '_blank');
                        },
                        children: (
                          <>
                            <IconContainer>
                              <ExplorerIcon />
                            </IconContainer>
                            <Base1300Text variant="b3_M">{t('components.AccountTxHistory.components.Aptos.index.goToExplorer')}</Base1300Text>
                          </>
                        ),
                      }
                    : undefined
                }
              />
            </>
          )}
        </EmptyAssetContainer>
      )}
    </Container>
  );
}
