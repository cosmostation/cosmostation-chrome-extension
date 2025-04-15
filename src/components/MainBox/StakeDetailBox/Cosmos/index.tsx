import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { useAmount } from '@/hooks/cosmos/useAmount';
import { useDelegationInfo } from '@/hooks/cosmos/useDelegationInfo';
import { useNTRNReward } from '@/hooks/cosmos/useNTRNReward';
import { useReward } from '@/hooks/cosmos/useReward';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { Route as ClaimAllRewards } from '@/pages/wallet/claim-all-rewards/$coinId';
import { Route as Stake } from '@/pages/wallet/stake/$coinId';
import { Route as UnStake } from '@/pages/wallet/unstake/$coinId';
import { gt, toDisplayDenomAmount } from '@/utils/numbers';
import { parseCoinId } from '@/utils/queryParamGenerator';

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

  const isNTRN = [NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID].some((item) => item === parseCoinId(coinId).chainId);

  const { data: ntrnRewards } = useNTRNReward({ coinId: isNTRN ? coinId : undefined });

  const { delegationAmount, rewardAmount } = useAmount(coinId);
  const reward = useReward({ coinId });

  const symbol = currentCoin?.asset.symbol;
  const decimals = currentCoin?.asset.decimals;
  const totalStakedDisplayAmount = toDisplayDenomAmount(delegationAmount, decimals || 0);

  const rewardsDisplayAmount = toDisplayDenomAmount(isNTRN ? ntrnRewards?.data.pending_rewards.amount || '0' : rewardAmount, decimals || 0);
  const rewardsCoinCounts = isNTRN ? 0 : reward?.data?.total?.length && reward.data.total.length > 1 ? reward.data.total.length - 1 : 0;

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
              <Base1000Text variant="b2_M">{t('components.MainBox.StakeDetailBox.Cosmos.index.staked')}</Base1000Text>
              <AmountContainer>
                <BalanceDisplay typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={6}>
                  {totalStakedDisplayAmount}
                </BalanceDisplay>
                &nbsp;
                <Base1300Text variant="h5n_M">{symbol}</Base1300Text>
              </AmountContainer>
            </BodyContentsContainer>
            <BodyContentsContainer>
              <Base1000Text variant="b2_M">
                {`${t('components.MainBox.StakeDetailBox.Cosmos.index.reward')} ${rewardsCoinCounts ? `+ ${rewardsCoinCounts}` : ''}`}
              </Base1000Text>
              <AmountContainer>
                <BalanceDisplay typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={6}>
                  {rewardsDisplayAmount}
                </BalanceDisplay>
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
              disabled={!gt(rewardsDisplayAmount, '0')}
              leadingIcon={<ClaimRewardIcon />}
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.StakeDetailBox.Cosmos.index.claim')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton
              style={{
                display: 'none',
              }}
              leadingIcon={<StakeIcon />}
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.StakeDetailBox.Cosmos.index.compound')}</SpacedTypography>
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
