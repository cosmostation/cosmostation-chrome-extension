import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';

import Base1300Text from '@/components/common/Base1300Text';
import EmptyAsset from '@/components/EmptyAsset';
import ListLoading from '@/components/Loading/ListLoading';
import { useScaffoldRef } from '@/components/Wrapper/components/Scaffold/components/AppLayout';
import { useAccountTxs } from '@/hooks/bitcoin/useAccountTxs';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { formatDateForHistory, sortByLatestDate } from '@/utils/date';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

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
  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  const {
    data: accountTxData,
    error,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
  } = useAccountTxs({
    coinId: coinId,
  });

  const selectedAsset = accountAllAssets?.bitcoinAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId));

  const accountExplorerUrl = selectedAsset?.chain.explorer.account
    ? selectedAsset.chain.explorer.account.replace('${address}', selectedAsset.address.address)
    : '';

  const mempoolTxs = useMemo(() => {
    const flattenedTxs = accountTxData?.pages?.flatMap((item) => item).filter((item) => !!item) || [];

    return flattenedTxs.filter((item) => item.status?.confirmed === false && !item.status.block_time);
  }, [accountTxData?.pages]);

  const txsGroupedByDate = useMemo(() => {
    const flattenedTxs = accountTxData?.pages?.flatMap((item) => item).filter((item) => !!item) || [];

    const formattedDates = flattenedTxs
      .sort((a, b) => sortByLatestDate(a?.status?.block_time, b?.status?.block_time))
      .map((item) => (item?.status?.block_time ? formatDateForHistory(String(item.status.block_time)) : ''))
      .filter((item) => !!item);

    const uniqueFormattedDates = formattedDates.filter((v, i, a) => a.indexOf(v) === i);

    return uniqueFormattedDates.map((uniqueFormattedDate) => {
      const filteredActivites = flattenedTxs.filter((tx) => {
        if (!tx?.status?.block_time) {
          return false;
        }

        return formatDateForHistory(String(tx.status.block_time)) === uniqueFormattedDate;
      });

      return {
        [uniqueFormattedDate]: filteredActivites,
      };
    });
  }, [accountTxData?.pages]);

  const isExistTxHistory = !!txsGroupedByDate.length || !!mempoolTxs.length;

  const addtionalLength = mempoolTxs.length > 0 ? 1 : 0;

  const scaffoldRef = useScaffoldRef();

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
                        <TxDetailContainer>{mempoolTxs.map((tx) => tx && <BitcoinMempoolTxItem key={tx.txid} coinId={coinId} tx={tx} />)}</TxDetailContainer>
                      </ContentsContainer>
                    ) : date && txsByDate ? (
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
