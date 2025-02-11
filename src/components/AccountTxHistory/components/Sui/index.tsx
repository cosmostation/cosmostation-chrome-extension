import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import IntersectionObserver from '@/components/common/IntersectionObserver';
import EmptyAsset from '@/components/EmptyAsset';
import ListLoading from '@/components/Loading/ListLoading';
import { useAccountTxs } from '@/hooks/sui/useAccountTxs';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { formatDateForHistory } from '@/utils/date';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import SuiTxItem from './components/SuiTxItem';
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

type SuiAccountTxHistory = {
  coinId: string;
};

export default function SuiAccountTxHistory({ coinId }: SuiAccountTxHistory) {
  const { t } = useTranslation();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  const { formattedTxBlocks, error, isFetchingNextPage, hasNextPage, fetchNextPage, isLoading } = useAccountTxs({
    coinId: coinId,
  });

  const selectedAsset = accountAllAssets?.bitcoinAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId));

  const accountExplorerUrl = selectedAsset?.chain.explorer?.account
    ? selectedAsset.chain.explorer.account.replace('${address}', selectedAsset.address.address)
    : '';

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
              title={t('components.AccountTxHistory.components.Sui.index.LoadingTitle')}
              subTitle={t('components.AccountTxHistory.components.Sui.index.LoadingSubTitle')}
            />
          ) : (
            <EmptyAsset
              icon={<NoSearchIcon />}
              title={t('components.AccountTxHistory.components.Sui.index.NoHistoryTitle')}
              subTitle={t('components.AccountTxHistory.components.Sui.index.NoHistorySubTitle')}
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
                          <Base1300Text variant="b3_M">{t('components.AccountTxHistory.components.Sui.index.goToExplorer')}</Base1300Text>
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
