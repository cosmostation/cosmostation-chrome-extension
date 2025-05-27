import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import IntersectionObserver from '@/components/common/IntersectionObserver';
import EmptyAsset from '@/components/EmptyAsset';
import ListLoading from '@/components/Loading/ListLoading';
import { useGetSignaturesForAddress } from '@/hooks/solana/useGetSignaturesForAddress';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { formatDateForHistory } from '@/utils/date';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';

import SolanaTxItem from './components/SolanaTxItem';
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

type SolanaAccountTxHistory = {
  coinId: string;
};

export default function SolanaAccountTxHistory({ coinId }: SolanaAccountTxHistory) {
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
  } = useGetSignaturesForAddress({
    coinId: coinId,
  });

  const selectedAsset = accountAllAssets?.allSolanaAccountAssets.find(({ asset }) => isMatchingCoinId(asset, coinId));

  const accountExplorerUrl = selectedAsset?.chain.explorer.account
    ? selectedAsset.chain.explorer.account.replace('${address}', selectedAsset.address.address)
    : '';

  const flattenedTxs = accountTxData?.pages?.flatMap((item) => item).filter((item) => !!item) || [];

  const txsGroupedByDate = (() => {
    const formattedDates = flattenedTxs
      .filter((item) => !!item)
      .filter((item) => item.blockTime)
      .map((item) => formatDateForHistory(String(item.blockTime!)));

    const uniqueFormattedDates = formattedDates.filter((v, i, a) => a.indexOf(v) === i);

    return uniqueFormattedDates.map((uniqueFormattedDate) => {
      const filteredActivites = flattenedTxs.filter((tx) => {
        const formattedSolanaTransactionTimestamp = formatDateForHistory(String(tx.blockTime!));

        return formattedSolanaTransactionTimestamp === uniqueFormattedDate;
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
                <TxDetailContainer>{txsByDate.map((tx) => tx && <SolanaTxItem key={tx.signature} coinId={coinId} tx={tx} />)}</TxDetailContainer>
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
              title={t('components.AccountTxHistory.components.Solana.index.LoadingTitle')}
              subTitle={t('components.AccountTxHistory.components.Solana.index.LoadingSubTitle')}
            />
          ) : (
            <>
              <EmptyAsset
                icon={<NoSearchIcon />}
                title={t('components.AccountTxHistory.components.Solana.index.NoHistoryTitle')}
                subTitle={t('components.AccountTxHistory.components.Solana.index.NoHistorySubTitle')}
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
                            <Base1300Text variant="b3_M">{t('components.AccountTxHistory.components.Solana.index.goToExplorer')}</Base1300Text>
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
