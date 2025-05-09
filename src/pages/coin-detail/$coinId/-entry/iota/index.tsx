import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import AccountTxHistory from '@/components/AccountTxHistory';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import CoinDetailBox from '@/components/MainBox/CoinDetailBox';
import { useGetAverageAPY } from '@/hooks/iota/useGetAverageAPY';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { Route as ManageStake } from '@/pages/coin-detail/$coinId/manage-stake';
import { parseCoinId } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';

import { HistoryContainer, HistorySectionTitle, StyledEdgeAligner } from './styled';
import AmountDetail from '../components/AmountDetail';
import SectionContainer from '../components/SectionContainer';
import SectionStickyContainer from '../components/SectionStickyContainer';
import SectionWrapper from '../components/SectionWrapper';
import StakePromotion from '../components/StakePromotion';

type IotaProps = {
  coinId: string;
};

export default function Iota({ coinId }: IotaProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });
  const { averageAPY } = useGetAverageAPY({ coinId });
  const selectedCoin = getIotaAccountAsset();

  const symbol = selectedCoin?.asset.symbol || shorterAddress(coinId, 6) || '';

  const isIotaMainCoin = parseCoinId(coinId).id === selectedCoin?.chain.mainAssetDenom;

  return (
    <BaseBody>
      <StyledEdgeAligner>
        <CoinDetailBox coinId={coinId} />

        <SectionWrapper>
          <SectionContainer>
            {isIotaMainCoin && (
              <StakePromotion
                symbol={symbol}
                apr={averageAPY + '%'}
                onClick={() => {
                  navigate({
                    to: ManageStake.to,
                    params: {
                      coinId: coinId,
                    },
                  });
                }}
              />
            )}
          </SectionContainer>
          {isIotaMainCoin && (
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
