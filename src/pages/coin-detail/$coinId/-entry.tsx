import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinDetailBox from '@/components/MainBox/CoinDetailBox';

import AmountDetail from './-components/AmountDetail';
import ContractAddress from './-components/ContractAddress';
import StakePromotion from './-components/StakePromotion';
import { Container, HistorySectionTitle, SectionContainer, SectionStickyContainer, SectionWrapper } from './-styled';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { t } = useTranslation();

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
              <StakePromotion symbol={symbol} />
            </SectionContainer>
            <SectionContainer>
              <AmountDetail uniqueCoinId="osmo" />
            </SectionContainer>
            <SectionContainer>
              <SectionStickyContainer>
                <HistorySectionTitle variant="h3_B">{t('pages.coin-detail.entry.history')}</HistorySectionTitle>
              </SectionStickyContainer>
            </SectionContainer>
          </SectionWrapper>
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
