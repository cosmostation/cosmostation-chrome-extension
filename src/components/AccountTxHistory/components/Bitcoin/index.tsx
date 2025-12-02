import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';

import Base1300Text from '@/components/common/Base1300Text';
import EmptyAsset from '@/components/EmptyAsset';
import ListLoading from '@/components/Loading/ListLoading';
import { useScaffoldRef } from '@/components/Wrapper/components/Scaffold/components/AppLayout';
import { useAccountTxs } from '@/hooks/bitcoin/useAccountTxs';
import { formatDateForHistory, sortByLatestDate } from '@/utils/date';

import BitcoinMempoolTxItem from './components/BitcoinMempoolTxItem';
import BitcoinTxItem from './components/BitcoinTxItem';
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

type BitcoinAccountTxHistory = {
  coinId: string;
};

export default function BitcoinAccountTxHistory({ coinId }: BitcoinAccountTxHistory) {
  const { t } = useTranslation();

  const {
    accountAsset: selectedAsset,
    data: accountTxData,
    error,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
  } = useAccountTxs({
    coinId: coinId,
  });

  const accountExplorerUrl = selectedAsset?.chain.explorer.account
    ? selectedAsset.chain.explorer.account.replace('${address}', selectedAsset.address.address)
    : '';

  const flattenedTxs = useMemo(() => accountTxData?.pages?.flatMap((item) => item).filter((item) => !!item) || [], [accountTxData?.pages]);

  const mempoolTxs = useMemo(() => {
    return flattenedTxs.filter((item) => item.status?.confirmed === false && !item.status.block_time);
  }, [flattenedTxs]);

  const txsGroupedByDate = useMemo(() => {
    const groupedByDate: Record<string, typeof flattenedTxs> = {};

    const sortedTxs = [...flattenedTxs].sort((a, b) => sortByLatestDate(a?.status?.block_time, b?.status?.block_time));

    for (const tx of sortedTxs) {
      if (!tx?.status?.block_time) continue;

      const dateKey = formatDateForHistory(String(tx.status.block_time));
      if (!dateKey) continue;

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }

      groupedByDate[dateKey].push(tx);
    }

    return Object.entries(groupedByDate).map(([date, txs]) => ({
      [date]: txs,
    }));
  }, [flattenedTxs]);

  const isExistTxHistory = !!txsGroupedByDate.length || !!mempoolTxs.length;

  const addtionalLength = mempoolTxs.length > 0 ? 1 : 0;

  const scaffoldRef = useScaffoldRef();

  const virtualizer = useVirtualizer({
    count: hasNextPage ? txsGroupedByDate.length + 1 + addtionalLength : txsGroupedByDate.length + addtionalLength,
    getScrollElement: () => scaffoldRef.current,
    estimateSize: () => 60,
    overscan: 3,
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
                const index = virtualItem.index;

                const isMempoolRow = addtionalLength > 0 && index === 0;

                const isLoaderRow = hasNextPage && index === txsGroupedByDate.length + addtionalLength - 1;

                const groupIndex = index - addtionalLength;
                const isTxGroupRow = groupIndex >= 0 && groupIndex < txsGroupedByDate.length;

                const renderItem = isTxGroupRow ? txsGroupedByDate[groupIndex] : null;
                const date = renderItem ? Object.keys(renderItem)[0] : null;
                const txsByDate = renderItem && date ? renderItem[date] : null;

                return (
                  <div key={virtualItem.key} data-index={index} ref={virtualizer.measureElement}>
                    {isLoaderRow ? (
                      <StyledCircularProgressContainer>
                        <StyledCircularProgress size={20} />
                      </StyledCircularProgressContainer>
                    ) : isMempoolRow ? (
                      <ContentsContainer>
                        <DateLineContainer>
                          <DateLine date={'Mempool'} hideCalendarIcon />
                        </DateLineContainer>
                        <TxDetailContainer>
                          <TxDetailContainer>{mempoolTxs.map((tx) => tx && <BitcoinMempoolTxItem key={tx.txid} coinId={coinId} tx={tx} />)}</TxDetailContainer>
                        </TxDetailContainer>
                      </ContentsContainer>
                    ) : isTxGroupRow && date && txsByDate ? (
                      <ContentsContainer key={date}>
                        <DateLineContainer>
                          <DateLine date={date} />
                        </DateLineContainer>
                        <TxDetailContainer>{txsByDate.map((tx) => tx && <BitcoinTxItem key={tx.txid} coinId={coinId} tx={tx} />)}</TxDetailContainer>
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
              title={t('components.AccountTxHistory.components.Bitcoin.index.LoadingTitle')}
              subTitle={t('components.AccountTxHistory.components.Bitcoin.index.LoadingSubTitle')}
            />
          ) : (
            <EmptyAsset
              icon={<NoSearchIcon />}
              title={t('components.AccountTxHistory.components.Bitcoin.index.NoHistoryTitle')}
              subTitle={t('components.AccountTxHistory.components.Bitcoin.index.NoHistorySubTitle')}
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
                          <Base1300Text variant="b3_M">{t('components.AccountTxHistory.components.Bitcoin.index.goToExplorer')}</Base1300Text>
                        </>
                      ),
                    }
                  : undefined
              }
            />
          )}
        </EmptyAssetContainer>
      )}
    </Container>
  );
}
