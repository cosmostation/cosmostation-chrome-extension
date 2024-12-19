import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import History from '@/components/History';
import CoinDetailBox from '@/components/MainBox/CoinDetailBox';
import { Route as ManageStake } from '@/pages/coin-detail/$coinId/manage-stake';

import AmountDetail from './-components/AmountDetail';
import ContractAddress from './-components/ContractAddress';
import StakePromotion from './-components/StakePromotion';
import { Container, HistoryContainer, HistorySectionTitle, SectionContainer, SectionStickyContainer, SectionWrapper } from './-styled';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const symbol = 'ATOM';
  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <CoinDetailBox testCoinId={coinId} />

          <SectionWrapper>
            <SectionContainer>
              <ContractAddress contractAddress={contractAddress} />
            </SectionContainer>
            <SectionContainer>
              <StakePromotion
                symbol={symbol}
                onClick={() => {
                  navigate({
                    to: ManageStake.to,
                    params: {
                      coinId: coinId,
                    },
                  });
                }}
              />
            </SectionContainer>
            <SectionContainer>
              <AmountDetail uniqueCoinId="osmo" />
            </SectionContainer>
            <SectionContainer>
              <SectionStickyContainer>
                <HistorySectionTitle variant="h3_B">{t('pages.coin-detail.entry.history')}</HistorySectionTitle>
              </SectionStickyContainer>
              <HistoryContainer>
                <History />
                <History />
                <History />
                <History />
                <History />
                <History />
                <History />
              </HistoryContainer>
            </SectionContainer>
          </SectionWrapper>
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
