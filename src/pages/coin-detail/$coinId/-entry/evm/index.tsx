import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import AccountTxHistory from '@/components/AccountTxHistory';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import CoinDetailBox from '@/components/MainBox/CoinDetailBox';
import { useChainList } from '@/hooks/useChainList';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { Route as ManageStake } from '@/pages/coin-detail/$coinId/manage-stake';
import { isAccountEVMStakableAsset } from '@/utils/asset';
import { isTestnetChain } from '@/utils/chain';
import { gt } from '@/utils/numbers';
import { getCoinIdWithManual } from '@/utils/queryParamGenerator';
import { shorterAddress, toPercentages } from '@/utils/string';

import { HistoryContainer, HistorySectionTitle, StyledEdgeAligner } from './styled';
import AmountDetail from '../components/AmountDetail';
import ContractAddress from '../components/ContractAddress';
import SectionContainer from '../components/SectionContainer';
import SectionStickyContainer from '../components/SectionStickyContainer';
import SectionWrapper from '../components/SectionWrapper';
import StakePromotion from '../components/StakePromotion';

type EVMProps = {
  coinId: string;
};

export default function EVM({ coinId }: EVMProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { chainList } = useChainList();
  const { getEVMAccountAsset } = useGetAccountAsset({ coinId });

  const selectedCoin = getEVMAccountAsset();

  const contractAddress = selectedCoin?.asset.type === 'erc20' ? selectedCoin.asset.id : undefined;
  const symbol = selectedCoin?.asset.symbol
    ? selectedCoin.asset.symbol + `${isTestnetChain(selectedCoin.chain.id) ? ' (Testnet)' : ''}`
    : shorterAddress(coinId, 6) || '';

  const isStakeable = selectedCoin ? isAccountEVMStakableAsset(selectedCoin) : false;

  const stakeCoinId =
    selectedCoin && selectedCoin.chain?.mainAssetDenom
      ? getCoinIdWithManual({
          id: selectedCoin.chain.mainAssetDenom,
          chainId: selectedCoin.chain.id,
          chainType: 'cosmos',
        })
      : undefined;

  const inCosmosChain = stakeCoinId ? chainList.cosmosChains?.find((item) => item.id === selectedCoin?.chain.id) : undefined;
  const apr = inCosmosChain?.apr && gt(inCosmosChain.apr, '0') ? toPercentages(inCosmosChain.apr) : undefined;

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
          {isStakeable && stakeCoinId && (
            <>
              <SectionContainer>
                <StakePromotion
                  symbol={symbol}
                  apr={apr}
                  onClick={() => {
                    navigate({
                      to: ManageStake.to,
                      params: {
                        coinId: stakeCoinId,
                      },
                    });
                  }}
                />
              </SectionContainer>
              <SectionContainer>
                <AmountDetail coinId={stakeCoinId} />
              </SectionContainer>
            </>
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
