import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import History from '@/components/History';
import CoinDetailBox from '@/components/MainBox/CoinDetailBox';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { Route as ManageStake } from '@/pages/coin-detail/$coinId/manage-stake';
import { getCoinId } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';

import { Container, HistoryContainer, HistorySectionTitle } from './styled';
import AmountDetail from '../components/AmountDetail';
import SectionContainer from '../components/SectionContainer';
import SectionStickyContainer from '../components/SectionStickyContainer';
import SectionWrapper from '../components/SectionWrapper';
import StakePromotion from '../components/StakePromotion';

type SuiProps = {
  coinId: string;
};

export default function Sui({ coinId }: SuiProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useAccountAssets();

  const selectedCoin = (() => {
    if (!data) return undefined;

    return data.suiAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
  })();

  const symbol = selectedCoin?.asset.symbol || shorterAddress(coinId, 6) || '';

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <CoinDetailBox coinId={coinId} />

          <SectionWrapper>
            {
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
            }
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
