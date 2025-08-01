import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import { InfiniteVirtualizedList } from '@/components/common/InfiniteVirtualizedList';
import EmptyAsset from '@/components/EmptyAsset';
import ListLoading from '@/components/Loading/ListLoading';
import { useAccountTxs } from '@/hooks/iota/useAccountTxs';
import { formatDateForHistory } from '@/utils/date';

import IotaTxItem from './components/IotaTxItem';
import { Container, ContentsContainer, DateLineContainer, EmptyAssetContainer, IconContainer, TxDetailContainer } from './styled';
import DateLine from '../Common/DateLine';

import ExplorerIcon from '@/assets/images/icons/Explorer14.svg';
import NoSearchIcon from '@/assets/images/icons/NoSearch70.svg';

type IotaAccountTxHistory = {
  coinId: string;
};

export default function IotaAccountTxHistory({ coinId }: IotaAccountTxHistory) {
  const { t } = useTranslation();

  const {
    accountAsset: selectedAsset,
    formattedTxBlocks,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useAccountTxs({
    coinId: coinId,
  });

  const accountExplorerUrl = selectedAsset?.chain.explorer?.account
    ? selectedAsset.chain.explorer.account.replace('${address}', selectedAsset.address.address)
    : '';

  const txsGroupedByDate = useMemo(() => {
    const groupedByFormattedDate: Record<string, typeof formattedTxBlocks> = {};

    for (const tx of formattedTxBlocks) {
      const ts = tx.analyzedTransaction.timestampMs;
      if (!ts) continue;

      const formatted = formatDateForHistory(ts);
      if (!groupedByFormattedDate[formatted]) {
        groupedByFormattedDate[formatted] = [];
      }
      groupedByFormattedDate[formatted].push(tx);
    }

    return Object.entries(groupedByFormattedDate).map(([date, txs]) => ({
      [date]: txs,
    }));
  }, [formattedTxBlocks]);

  const isExistTxHistory = !!txsGroupedByDate.length;

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
                  <TxDetailContainer>
                    {txsByDate.map((tx) => tx && <IotaTxItem key={tx.analyzedTransaction.digest} coinId={coinId} tx={tx.analyzedTransaction} />)}
                  </TxDetailContainer>
                </ContentsContainer>
              );
            }}
            overscan={10}
            fetchNextPage={fetchNextPage}
            hasNextPage={!isFetchingNextPage && hasNextPage && !error}
            isFetchingNextPage={isFetchingNextPage}
          />
        </ContentsContainer>
      ) : (
        <EmptyAssetContainer>
          {isLoading ? (
            <ListLoading
              title={t('components.AccountTxHistory.components.Iota.index.LoadingTitle')}
              subTitle={t('components.AccountTxHistory.components.Iota.index.LoadingSubTitle')}
            />
          ) : (
            <EmptyAsset
              icon={<NoSearchIcon />}
              title={t('components.AccountTxHistory.components.Iota.index.NoHistoryTitle')}
              subTitle={t('components.AccountTxHistory.components.Iota.index.NoHistorySubTitle')}
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
                          <Base1300Text variant="b3_M">{t('components.AccountTxHistory.components.Iota.index.goToExplorer')}</Base1300Text>
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
