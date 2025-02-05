import { useTranslation } from 'react-i18next';

import IntersectionObserver from '@/components/common/IntersectionObserver';
import EmptyAsset from '@/components/EmptyAsset';
import { useAccountTxs } from '@/hooks/evm/useAccountTxs';
import { formatDateForHistory } from '@/utils/date';

import EVMTxItem from './components/EVMTxItem';
import {
  Container,
  ContentsContainer,
  DateLineContainer,
  EmptyAssetContainer,
  StyledCircularProgress,
  StyledCircularProgressContainer,
  TxDetailContainer,
} from './styled';
import DateLine from '../DateLine';

import NoSearchIcon from '@/assets/images/icons/NoSearch70.svg';

type EVMAccountTxHistory = {
  coinId: string;
};

export default function EVMAccountTxHistory({ coinId }: EVMAccountTxHistory) {
  const { t } = useTranslation();

  const {
    data: accountTxData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useAccountTxs({
    coinId: coinId,
  });

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
          {txsGroupedByDate.map((item) => {
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
          })}
          {isFetchingNextPage && (
            <StyledCircularProgressContainer>
              <StyledCircularProgress size={20} />
            </StyledCircularProgressContainer>
          )}
          <IntersectionObserver
            onIntersect={async () => {
              if (hasNextPage) {
                fetchNextPage();
              }
            }}
          />
        </ContentsContainer>
      ) : (
        <EmptyAssetContainer>
          <EmptyAsset
            icon={<NoSearchIcon />}
            title={t('components.AccountTxHistory.components.EVM.index.NoHistoryTitle')}
            subTitle={t('components.AccountTxHistory.components.EVM.index.NoHistorySubTitle')}
          />
        </EmptyAssetContainer>
      )}
    </Container>
  );
}
