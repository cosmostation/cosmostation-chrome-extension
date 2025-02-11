import { useTranslation } from 'react-i18next';
import { isPendingTransactionResponse } from '@aptos-labs/ts-sdk';

import Base1300Text from '@/components/common/Base1300Text';
import IntersectionObserver from '@/components/common/IntersectionObserver';
import EmptyAsset from '@/components/EmptyAsset';
import ListLoading from '@/components/Loading/ListLoading';
import { useGetAccountTransactions } from '@/hooks/aptos/useGetAccountTransactions';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { formatAptosTxTimestamp, getTimestamp } from '@/utils/aptos/tx';
import { sortByLatestDate } from '@/utils/date';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

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
  } = useGetAccountTransactions({
    coinId: coinId,
  });

  const selectedAsset = accountAllAssets?.aptosAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId));

  const accountExplorerUrl = selectedAsset?.chain.explorer.account
    ? selectedAsset.chain.explorer.account.replace('${address}', selectedAsset.address.address)
    : '';

  const flattenedTxs = accountTxData?.pages?.flatMap((item) => item).filter((item) => !!item) || [];

  const pendingTxs = flattenedTxs.filter((tx) => !!isPendingTransactionResponse(tx));

  const txsGroupedByDate = (() => {
    const formattedDates = flattenedTxs
      .filter((item) => !isPendingTransactionResponse(item))
      .sort((a, b) => sortByLatestDate(getTimestamp(a), getTimestamp(b)))
      .map((item) => formatAptosTxTimestamp(item))
      .filter((item) => !!item);

    const uniqueFormattedDates = formattedDates.filter((v, i, a) => a.indexOf(v) === i);

    return uniqueFormattedDates.map((uniqueFormattedDate) => {
      const filteredActivites = flattenedTxs.filter((tx) => {
        const formattedAptosTransactionTimestamp = formatAptosTxTimestamp(tx);

        return formattedAptosTransactionTimestamp === uniqueFormattedDate;
      });

      return {
        [uniqueFormattedDate]: filteredActivites,
      };
    });
  })();

  const isExistTxHistory = !!txsGroupedByDate.length || !!pendingTxs.length;

  return (
    <Container>
      {isExistTxHistory ? (
        <ContentsContainer>
          {pendingTxs.length > 0 && (
            <ContentsContainer>
              <DateLineContainer>
                <DateLine date={'Mempool'} hideCalendarIcon />
              </DateLineContainer>
              <TxDetailContainer>{pendingTxs.map((tx) => tx && <AptosPendingTxItem key={tx.hash} coinId={coinId} tx={tx} />)}</TxDetailContainer>
            </ContentsContainer>
          )}

          {txsGroupedByDate.map((item) => {
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
          })}
          {isFetchingNextPage && (
            <StyledCircularProgressContainer>
              <StyledCircularProgress size={20} />
            </StyledCircularProgressContainer>
          )}
          {!isFetchingNextPage && hasNextPage && !error && (
            <IntersectionObserver
              onIntersect={async () => {
                if (hasNextPage) {
                  fetchNextPage();
                }
              }}
            />
          )}
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
