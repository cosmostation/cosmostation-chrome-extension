import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isPendingTransactionResponse } from '@aptos-labs/ts-sdk';

import Base1300Text from '@/components/common/Base1300Text';
import { InfiniteVirtualizedList } from '@/components/common/InfiniteVirtualizedList';
import EmptyAsset from '@/components/EmptyAsset';
import ListLoading from '@/components/Loading/ListLoading';
import { useGetAccountTransactions } from '@/hooks/aptos/useGetAccountTransactions';
import { formatAptosTxTimestamp, getTimestamp } from '@/utils/aptos/tx';
import { sortByLatestDate } from '@/utils/date';

import AptosTxItem from './components/AptosTxItem';
import { Container, ContentsContainer, DateLineContainer, EmptyAssetContainer, IconContainer, TxDetailContainer } from './styled';
import DateLine from '../Common/DateLine';

import ExplorerIcon from '@/assets/images/icons/Explorer14.svg';
import NoSearchIcon from '@/assets/images/icons/NoSearch70.svg';

type AptosAccountTxHistory = {
  coinId: string;
};

export default function AptosAccountTxHistory({ coinId }: AptosAccountTxHistory) {
  const { t } = useTranslation();

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

  return (
    <Container>
      {isExistTxHistory ? (
        <ContentsContainer>
          <InfiniteVirtualizedList
            items={txsGroupedByDate}
            estimateSize={() => 60}
            renderItem={(item) => {
              const date = Object.keys(item)[0];
              const txsByDate = item[date];

              return (
                <ContentsContainer key={date}>
                  <DateLineContainer>
                    <DateLine date={date} />
                  </DateLineContainer>
                  <TxDetailContainer>{txsByDate.map((tx) => tx && <AptosTxItem key={tx.hash} coinId={coinId} tx={tx} />)}</TxDetailContainer>
                </ContentsContainer>
              );
            }}
            overscan={3}
            fetchNextPage={fetchNextPage}
            hasNextPage={!isFetchingNextPage && hasNextPage && !error}
            isFetchingNextPage={isFetchingNextPage}
          />
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
