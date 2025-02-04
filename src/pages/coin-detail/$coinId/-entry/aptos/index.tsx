import { useTranslation } from 'react-i18next';

import AccountTxHistory from '@/components/AccountTxHistory';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import CoinDetailBox from '@/components/MainBox/CoinDetailBox';

import { HistoryContainer, HistorySectionTitle, StyledEdgeAligner } from './styled';
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
      <StyledEdgeAligner>
        <CoinDetailBox coinId={coinId} />

        <SectionWrapper>
          <SectionContainer>
            <AmountDetail coinId={coinId} />
          </SectionContainer>
          <SectionContainer
            style={{
              flex: 1,
            }}
          >
            <SectionStickyContainer>
              <HistorySectionTitle variant="h3_B">{t('pages.coin-detail.entry.history')}</HistorySectionTitle>
            </SectionStickyContainer>
            <HistoryContainer>
              <AccountTxHistory coinId={coinId} />
            </HistoryContainer>
          </SectionContainer>
        </SectionWrapper>
      </StyledEdgeAligner>
    </BaseBody>
  );
}
