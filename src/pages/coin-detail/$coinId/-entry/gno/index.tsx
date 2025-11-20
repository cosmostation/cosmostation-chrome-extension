import { useTranslation } from 'react-i18next';

import AccountTxHistory from '@/components/AccountTxHistory';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import CoinDetailBox from '@/components/MainBox/CoinDetailBox';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

import { HistoryContainer, HistorySectionTitle, StyledEdgeAligner } from './styled';
import ContractAddress from '../components/ContractAddress';
import SectionContainer from '../components/SectionContainer';
import SectionStickyContainer from '../components/SectionStickyContainer';
import SectionWrapper from '../components/SectionWrapper';

type GnoProps = {
  coinId: string;
};

export default function Gno({ coinId }: GnoProps) {
  const { t } = useTranslation();

  const { getGnoAccountAsset } = useGetAccountAsset({ coinId });

  const selectedCoin = getGnoAccountAsset();

  const contractAddress = selectedCoin?.asset.type === 'grc20' ? selectedCoin.asset.id : undefined;

  return (
    <BaseBody>
      <StyledEdgeAligner>
        <CoinDetailBox coinId={coinId} />

        <SectionWrapper>
          {contractAddress && (
            <SectionContainer>
              <ContractAddress contractAddress={contractAddress} />
            </SectionContainer>
          )}
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
