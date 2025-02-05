import { useTranslation } from 'react-i18next';

import IntersectionObserver from '@/components/common/IntersectionObserver';
import EmptyAsset from '@/components/EmptyAsset';
import { useAccountTxs } from '@/hooks/sui/useAccountTxs';
import { formatDateForHistory } from '@/utils/date';

import SuiTxItem from './components/SuiTxItem';
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

type SuiAccountTxHistory = {
  coinId: string;
};

export default function SuiAccountTxHistory({ coinId }: SuiAccountTxHistory) {
  const { t } = useTranslation();

  const { formattedTxBlocks, isFetchingNextPage, hasNextPage, fetchNextPage } = useAccountTxs({
    coinId: coinId,
  });

  const txsGroupedByDate = (() => {
    const formattedDates = formattedTxBlocks
      .map((item) => (item.analyzedTransaction.timestampMs ? formatDateForHistory(item.analyzedTransaction.timestampMs) : ''))
      .filter((item) => !!item);

    const uniqueFormattedDates = formattedDates.filter((v, i, a) => a.indexOf(v) === i);

    return uniqueFormattedDates.map((uniqueFormattedDate) => {
      const filteredActivites = formattedTxBlocks.filter((tx) => {
        if (!tx.analyzedTransaction.timestampMs) {
          return false;
        }

        return formatDateForHistory(tx.analyzedTransaction.timestampMs) === uniqueFormattedDate;
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
          {txsGroupedByDate.map((item) => {
            const date = Object.keys(item)[0];
            const txsByDate = item[date];

            return (
              <ContentsContainer key={date}>
                <DateLineContainer>
                  <DateLine date={date} />
                </DateLineContainer>
                <TxDetailContainer>
                  {txsByDate.map((tx) => tx && <SuiTxItem key={tx.analyzedTransaction.digest} coinId={coinId} tx={tx.analyzedTransaction} />)}
                </TxDetailContainer>
              </ContentsContainer>
            );
          })}
          {isFetchingNextPage && (
            <StyledCircularProgressContainer>
              <StyledCircularProgress size={20} />
            </StyledCircularProgressContainer>
          )}
          {!isFetchingNextPage && hasNextPage && (
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
            title={t('components.AccountTxHistory.components.Sui.index.NoHistoryTitle')}
            subTitle={t('components.AccountTxHistory.components.Sui.index.NoHistorySubTitle')}
          />
        </EmptyAssetContainer>
      )}
    </Container>
  );
}
