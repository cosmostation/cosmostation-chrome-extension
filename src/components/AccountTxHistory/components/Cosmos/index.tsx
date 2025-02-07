import { useTranslation } from 'react-i18next';

import IntersectionObserver from '@/components/common/IntersectionObserver';
import EmptyAsset from '@/components/EmptyAsset';
import { useAccountTxs } from '@/hooks/cosmos/useAccountTxs';
import { formatDateForHistory } from '@/utils/date';

import CosmosTxItem from './components/CosmosTxItem';
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

type CosmosAccountTxHistory = {
  coinId: string;
};

export default function CosmosAccountTxHistory({ coinId }: CosmosAccountTxHistory) {
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

  const flattenedTxs = accountTxData?.pages?.flatMap((item) => item).filter((item) => item) || [];

  const txsGroupedByDate = (() => {
    const formattedDates = flattenedTxs.map((item) => (item?.data?.timestamp ? formatDateForHistory(item?.data?.timestamp) : '')).filter((item) => !!item);

    const uniqueFormattedDates = formattedDates.filter((v, i, a) => a.indexOf(v) === i);

    return uniqueFormattedDates.map((uniqueFormattedDate) => {
      const filteredActivites = flattenedTxs.filter((tx) => {
        if (!tx?.data?.timestamp) {
          return false;
        }

        return formatDateForHistory(tx.data.timestamp) === uniqueFormattedDate;
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
                <TxDetailContainer>{txsByDate.map((tx) => tx && <CosmosTxItem key={tx.data?.txhash} coinId={coinId} tx={tx} />)}</TxDetailContainer>
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
            title={t('components.AccountTxHistory.components.Cosmos.index.NoHistoryTitle')}
            subTitle={t('components.AccountTxHistory.components.Cosmos.index.NoHistorySubTitle')}
          />
        </EmptyAssetContainer>
      )}
    </Container>
  );
}
