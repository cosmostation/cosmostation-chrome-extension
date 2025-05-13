import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import AccountTxHistory from '@/components/AccountTxHistory';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import CoinDetailBox from '@/components/MainBox/CoinDetailBox';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { Route as ManageStake } from '@/pages/coin-detail/$coinId/manage-stake';
import { isTestnetChain } from '@/utils/chain';
import { gt } from '@/utils/numbers';
import { shorterAddress, toPercentages } from '@/utils/string';

import { HistoryContainer, HistorySectionTitle, StyledEdgeAligner } from './styled';
import AmountDetail from '../components/AmountDetail';
import ContractAddress from '../components/ContractAddress';
import SectionContainer from '../components/SectionContainer';
import SectionStickyContainer from '../components/SectionStickyContainer';
import SectionWrapper from '../components/SectionWrapper';
import StakePromotion from '../components/StakePromotion';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const selectedCoin = getCosmosAccountAsset();

  const contractAddress = selectedCoin?.asset.type === 'cw20' || selectedCoin?.asset.type === 'ibc' ? selectedCoin.asset.id : undefined;
  const symbol = selectedCoin?.asset.symbol
    ? selectedCoin.asset.symbol + `${isTestnetChain(selectedCoin.chain.id) ? ' (Testnet)' : ''}`
    : shorterAddress(coinId, 6) || '';

  const isStakeable = selectedCoin?.chain.isSupportStaking && selectedCoin.asset.id === selectedCoin.chain.mainAssetDenom;

  const apr = selectedCoin?.chain.apr && gt(selectedCoin.chain.apr, '0') ? toPercentages(selectedCoin.chain.apr) : undefined;

  return (
    <BaseBody>
      <StyledEdgeAligner>
        <CoinDetailBox coinId={coinId} />

        <SectionWrapper>
          {contractAddress && (
            <SectionContainer>
              <ContractAddress
                contractAddress={contractAddress}
                title={selectedCoin?.asset.type === 'ibc' ? t('pages.coin-detail.entry.denom') : undefined}
                toastText={selectedCoin?.asset.type === 'ibc' ? t('pages.coin-detail.entry.copiedDenom') : undefined}
              />
            </SectionContainer>
          )}
          {isStakeable && (
            <SectionContainer>
              <StakePromotion
                symbol={symbol}
                apr={apr}
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
          )}
          {isStakeable && (
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
