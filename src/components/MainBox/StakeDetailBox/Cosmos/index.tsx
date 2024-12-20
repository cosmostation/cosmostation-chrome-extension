import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { Route as ClaimAllRewards } from '@/pages/wallet/claim-all-rewards/$coinId';
import { Route as Stake } from '@/pages/wallet/stake/$coinId';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';

import { AmountContainer, BodyContainer, BodyContentsContainer, BottomButtonContainer, SpacedTypography, StyledIconTextButton, TopContainer } from './styled';
import MainBox from '../..';

import StakeIcon from '@/assets/images/icons/Stake22.svg';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useAccountAssets();
  const currentCoin = data?.cosmosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const symbol = currentCoin?.asset.symbol;
  const decimals = currentCoin?.asset.decimals;
  const availableAmount = toDisplayDenomAmount(currentCoin?.balance || '0', decimals || 0);
  const rewardAmount = '80';

  return (
    <>
      <MainBox
        top={
          <TopContainer>
            <Base1300Text variant="h2_B">
              {t('components.MainBox.StakeDetailBox.Cosmos.index.title', {
                symbol: symbol,
              })}
            </Base1300Text>
          </TopContainer>
        }
        body={
          <BodyContainer>
            <BodyContentsContainer>
              <Base1000Text variant="b2_M">{t('components.MainBox.StakeDetailBox.Cosmos.index.available')}</Base1000Text>
              <AmountContainer>
                <NumberTypo typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={decimals}>
                  {availableAmount}
                </NumberTypo>
                &nbsp;
                <Base1300Text variant="h5n_M">{symbol}</Base1300Text>
              </AmountContainer>
            </BodyContentsContainer>
            <BodyContentsContainer>
              <Base1000Text variant="b2_M">
                {t('components.MainBox.StakeDetailBox.Cosmos.index.reward', {
                  counts: 3,
                })}
              </Base1000Text>
              <AmountContainer>
                <NumberTypo typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={decimals}>
                  {rewardAmount}
                </NumberTypo>
                &nbsp;
                <Base1300Text variant="h5n_M">{symbol}</Base1300Text>
              </AmountContainer>
            </BodyContentsContainer>
          </BodyContainer>
        }
        bottom={
          <BottomButtonContainer>
            <StyledIconTextButton
              onClick={() => {
                navigate({
                  to: Stake.to,
                  params: { coinId: coinId },
                });
              }}
              leadingIcon={<StakeIcon />}
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">
                {t('components.MainBox.StakeDetailBox.Cosmos.index.stake', {
                  symbol: symbol,
                })}
              </SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton
              onClick={() => {
                navigate({
                  to: ClaimAllRewards.to,
                  params: { coinId: coinId },
                });
              }}
              leadingIcon={<StakeIcon />}
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.StakeDetailBox.Cosmos.index.claimAll')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton leadingIcon={<StakeIcon />} direction="vertical">
              <SpacedTypography variant="b3_M">{t('components.MainBox.StakeDetailBox.Cosmos.index.compountAll')}</SpacedTypography>
            </StyledIconTextButton>
          </BottomButtonContainer>
        }
        className="circleGradient"
        coinBackgroundImage={'https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/sui/asset/sui.png'}
      />
    </>
  );
}
