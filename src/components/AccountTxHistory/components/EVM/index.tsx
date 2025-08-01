import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import { InfiniteVirtualizedList } from '@/components/common/InfiniteVirtualizedList';
import EmptyAsset from '@/components/EmptyAsset';
import ListLoading from '@/components/Loading/ListLoading';
import { useAccountTxs } from '@/hooks/evm/useAccountTxs';
import type { AccountTx } from '@/types/evm/txs';
import { formatDateForHistory } from '@/utils/date';

import EVMTxItem from './components/EVMTxItem';
import { Container, ContentsContainer, DateLineContainer, EmptyAssetContainer, IconContainer, TxDetailContainer } from './styled';
import DateLine from '../Common/DateLine';

import ExplorerIcon from '@/assets/images/icons/Explorer14.svg';
import NoSearchIcon from '@/assets/images/icons/NoSearch70.svg';

type EVMAccountTxHistory = {
  coinId: string;
};

export default function EVMAccountTxHistory({ coinId }: EVMAccountTxHistory) {
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

  const accountExplorerUrl = selectedAsset?.chain.explorer?.account
    ? selectedAsset.chain.explorer.account.replace('${address}', selectedAsset.address.address)
    : '';

  const txsGroupedByDate = useMemo(() => {
    const groupedByFormattedDate: Record<string, AccountTx[]> = {};

    if (!accountTxData?.pages) return [];

    for (const page of accountTxData.pages) {
      if (!page?.txs) continue;
      for (const tx of page.txs) {
        if (!tx.txTime) continue;

        const formatted = formatDateForHistory(tx.txTime);
        if (!groupedByFormattedDate[formatted]) {
          groupedByFormattedDate[formatted] = [];
        }
        groupedByFormattedDate[formatted].push(tx);
      }
    }

    return Object.entries(groupedByFormattedDate).map(([date, txs]) => ({
      [date]: txs,
    }));
  }, [accountTxData?.pages]);

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
                  <TxDetailContainer>{txsByDate.map((tx) => tx && <EVMTxItem key={tx.txHash} coinId={coinId} tx={tx} />)}</TxDetailContainer>
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
              title={t('components.AccountTxHistory.components.EVM.index.LoadingTitle')}
              subTitle={t('components.AccountTxHistory.components.EVM.index.LoadingSubTitle')}
            />
          ) : (
            <EmptyAsset
              icon={<NoSearchIcon />}
              title={t('components.AccountTxHistory.components.EVM.index.NoHistoryTitle')}
              subTitle={t('components.AccountTxHistory.components.EVM.index.NoHistorySubTitle')}
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
                          <Base1300Text variant="b3_M">{t('components.AccountTxHistory.components.EVM.index.goToExplorer')}</Base1300Text>
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
