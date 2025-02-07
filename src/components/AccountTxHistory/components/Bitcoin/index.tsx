import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import IntersectionObserver from '@/components/common/IntersectionObserver';
import EmptyAsset from '@/components/EmptyAsset';
import { useAccountTxs } from '@/hooks/bitcoin/useAccountTxs';
import { formatDateForHistory, sortByLatestDate } from '@/utils/date';

import BitcoinMempoolTxItem from './components/BitcoinMempoolTxItem';
import BitcoinTxItem from './components/BitcoinTxItem';
import {
  Container,
  ContentsContainer,
  DateLineContainer,
  EmptyAssetContainer,
  StyledCircularProgress,
  StyledCircularProgressContainer,
  TxDetailContainer,
} from './styled';
import DateLine from '../Common/DateLine';

import NoSearchIcon from '@/assets/images/icons/NoSearch70.svg';

type BitcoinAccountTxHistory = {
  coinId: string;
};

export default function BitcoinAccountTxHistory({ coinId }: BitcoinAccountTxHistory) {
  const { t } = useTranslation();

  const {
    data: accountTxData,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useAccountTxs({
    coinId: coinId,
  });

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

  return (
    <Container>
      {isExistTxHistory ? (
        <ContentsContainer>
          {mempoolTxs.length > 0 && (
            <ContentsContainer>
              <DateLineContainer>
                <DateLine date={'Mempool'} hideCalendarIcon />
              </DateLineContainer>
              <TxDetailContainer>{mempoolTxs.map((tx) => tx && <BitcoinMempoolTxItem key={tx.txid} coinId={coinId} tx={tx} />)}</TxDetailContainer>
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
                <TxDetailContainer>{txsByDate.map((tx) => tx && <BitcoinTxItem key={tx.txid} coinId={coinId} tx={tx} />)}</TxDetailContainer>
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
          <EmptyAsset
            icon={<NoSearchIcon />}
            title={t('components.AccountTxHistory.components.Bitcoin.index.NoHistoryTitle')}
            subTitle={t('components.AccountTxHistory.components.Bitcoin.index.NoHistorySubTitle')}
          />
        </EmptyAssetContainer>
      )}
    </Container>
  );
}
