import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import { useAmount } from '@/hooks/cosmos/useAmount';
import { useDelegationInfo } from '@/hooks/cosmos/useDelegationInfo';
import { useReward } from '@/hooks/cosmos/useReward';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { Route as ClaimAllRewards } from '@/pages/wallet/claim-all-rewards/$coinId';
import { Route as Stake } from '@/pages/wallet/stake/$coinId';
import { Route as UnStake } from '@/pages/wallet/unstake/$coinId';
import { toDisplayDenomAmount } from '@/utils/numbers';

import { AmountContainer, BodyContainer, BodyContentsContainer, BottomButtonContainer, SpacedTypography, StyledIconTextButton, TopContainer } from './styled';
import MainBox from '../..';

import ClaimRewardIcon from '@/assets/images/icons/ClaimReward22.svg';
import StakeIcon from '@/assets/images/icons/Stake22.svg';
import UnstakeIcon from '@/assets/images/icons/Unstake22.svg';

import stakemanageBg from '@/assets/images/stakeManageBg.png';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });
  const currentCoin = getCosmosAccountAsset();

  const { delegationInfo } = useDelegationInfo({ coinId });

  const { rewardAmount } = useAmount(coinId);
  const reward = useReward({ coinId });

  const symbol = currentCoin?.asset.symbol;
  const decimals = currentCoin?.asset.decimals;
  const availableAmount = toDisplayDenomAmount(currentCoin?.balance || '0', decimals || 0);

  const rewardsDisplayAmount = toDisplayDenomAmount(rewardAmount, decimals || 0);
  const rewardsCoinCounts = reward?.data?.total?.length || 0;

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
                {`${t('components.MainBox.StakeDetailBox.Cosmos.index.reward')} ${rewardsCoinCounts ? `+ ${rewardsCoinCounts}` : ''}`}
              </Base1000Text>
              <AmountContainer>
                <NumberTypo typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={decimals}>
                  {rewardsDisplayAmount}
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
              <SpacedTypography variant="b3_M">{t('components.MainBox.StakeDetailBox.Cosmos.index.stake')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton
              onClick={() => {
                navigate({
                  to: UnStake.to,
                  params: {
                    coinId: coinId,
                  },
                });
              }}
              disabled={!delegationInfo || delegationInfo.length === 0}
              leadingIcon={<UnstakeIcon />}
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.StakeDetailBox.Cosmos.index.unstake')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton
              onClick={() => {
                navigate({
                  to: ClaimAllRewards.to,
                  params: { coinId: coinId },
                });
              }}
              leadingIcon={<ClaimRewardIcon />}
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
        bgImageClassName="stake"
        coinBackgroundImage={stakemanageBg}
      />
    </>
  );
}
