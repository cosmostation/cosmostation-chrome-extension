import { useTranslation } from 'react-i18next';

// import { useNavigate } from '@tanstack/react-router';
import AccountTxHistory from '@/components/AccountTxHistory';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import CoinDetailBox from '@/components/MainBox/CoinDetailBox';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
// import { Route as ManageStake } from '@/pages/coin-detail/$coinId/manage-stake';
import { parseCoinId } from '@/utils/queryParamGenerator';

// import { shorterAddress } from '@/utils/string';
import { HistoryContainer, HistorySectionTitle, StyledEdgeAligner } from './styled';
import AmountDetail from '../components/AmountDetail';
import SectionContainer from '../components/SectionContainer';
import SectionStickyContainer from '../components/SectionStickyContainer';
import SectionWrapper from '../components/SectionWrapper';
// import StakePromotion from '../components/StakePromotion';

type SolanaProps = {
  coinId: string;
};

export default function Solana({ coinId }: SolanaProps) {
  const { t } = useTranslation();
  // const navigate = useNavigate();

  const { getSolanaAccountAsset } = useGetAccountAsset({ coinId });
  const selectedCoin = getSolanaAccountAsset();

  // const symbol = selectedCoin?.asset.symbol || shorterAddress(coinId, 6) || '';

  const isSolanaMainCoin = parseCoinId(coinId).id === selectedCoin?.chain.mainAssetDenom;

  return (
    <BaseBody>
      <StyledEdgeAligner>
        <CoinDetailBox coinId={coinId} />

        <SectionWrapper>
          {isSolanaMainCoin && (
            <SectionContainer>
              <AmountDetail coinId={coinId} />
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
