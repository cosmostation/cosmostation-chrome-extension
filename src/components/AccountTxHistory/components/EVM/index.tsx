import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import { InfiniteVirtualizedList } from '@/components/common/InfiniteVirtualizedList';
import EmptyAsset from '@/components/EmptyAsset';
import ListLoading from '@/components/Loading/ListLoading';
import { useAccountTxs } from '@/hooks/evm/useAccountTxs';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { formatDateForHistory } from '@/utils/date';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

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

  const selectedAsset = accountAllAssets?.allEVMAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId));

  const accountExplorerUrl = selectedAsset?.chain.explorer?.account
    ? selectedAsset.chain.explorer.account.replace('${address}', selectedAsset.address.address)
    : '';

  const flattenedTxs = accountTxData?.pages?.flatMap((item) => item?.txs).filter((item) => item) || [];

  const txsGroupedByDate = (() => {
    const formattedDates = flattenedTxs.map((item) => (item?.txTime ? formatDateForHistory(item.txTime) : '')).filter((item) => !!item);

    const uniqueFormattedDates = formattedDates.filter((v, i, a) => a.indexOf(v) === i);

    return uniqueFormattedDates.map((uniqueFormattedDate) => {
      const filteredActivites = flattenedTxs.filter((tx) => {
        if (!tx?.txTime) {
          return false;
        }

        return formatDateForHistory(tx.txTime) === uniqueFormattedDate;
      });

      return {
        [uniqueFormattedDate]: filteredActivites,
      };
    });
  })();

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
