import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import History from '@/components/History';
import CoinDetailBox from '@/components/MainBox/CoinDetailBox';

import { Container, HistoryContainer, HistorySectionTitle } from './styled';
import AmountDetail from '../components/AmountDetail';
import SectionContainer from '../components/SectionContainer';
import SectionStickyContainer from '../components/SectionStickyContainer';
import SectionWrapper from '../components/SectionWrapper';

type AptosProps = {
  coinId: string;
};

export default function Aptos({ coinId }: AptosProps) {
  const { t } = useTranslation();

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <CoinDetailBox coinId={coinId} />

          <SectionWrapper>
            <SectionContainer>
              <AmountDetail coinId={coinId} />
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
