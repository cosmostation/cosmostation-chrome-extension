import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import NumberTypo from '@/components/common/NumberTypo';
import { Route as ClaimRewards } from '@/pages/wallet/claim-rewards/$coinId/$validatorAddress';
import { Route as Stake } from '@/pages/wallet/stake/$coinId/$validatorAddress';
import { Route as Unstake } from '@/pages/wallet/unstake/$coinId/$validatorAddress';
import type { ValidatorStatus } from '@/types/cosmos/validator';

import {
  AmountContainer,
  CommissionContainer,
  RightChevronIconContainer,
  StakingInfoContainer,
  StakingInfoRowContainer,
  StyledButton,
  StyledValidatorImage,
  TopContainer,
  TopLeftContainer,
  ValidatorNameContainer,
  ValidatorNameWrapper,
} from './styled';
import StakingOptionBottomSheet from '../../../components/StakingOptionBottomSheet';

import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type StakingItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  stakingCoinId: string;
  validatorAddress: string;
  validatorName: string;
  symbol: string;
  decimals: number;
  stakedAmount: string;
  rewardAmount: string;
  status?: ValidatorStatus;
  commission?: string;
  rewardCounts?: string;
  validatorImage?: string;
  isHideReward?: boolean;
};

export default function StakingItem({
  stakingCoinId,
  validatorAddress,
  validatorName,
  commission,
  symbol,
  stakedAmount,
  status,
  rewardAmount,
  rewardCounts,
  validatorImage,
  isHideReward = false,
  ...remainder
}: StakingItemProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isOpenStakingOptionBottomSheet, setIsOpenStakingOptionBottomSheet] = useState(false);

  return (
    <>
      <StyledButton
        type="button"
        onClick={() => {
          setIsOpenStakingOptionBottomSheet(true);
        }}
        {...remainder}
      >
        <TopContainer>
          <StyledValidatorImage imageURL={validatorImage} status={status} />
          <TopLeftContainer>
            <ValidatorNameWrapper>
              <ValidatorNameContainer>
                <Base1300Text variant="b2_M">{validatorName}</Base1300Text>
              </ValidatorNameContainer>
              <RightChevronIconContainer>
                <RightChevronIcon />
              </RightChevronIconContainer>
            </ValidatorNameWrapper>
            <CommissionContainer>
              <Base1000Text variant="b4_R">
                {`${t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.commission')} : `}
                <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={2}>
                  {commission}
                </NumberTypo>
                %
              </Base1000Text>
            </CommissionContainer>
          </TopLeftContainer>
        </TopContainer>
        <StakingInfoContainer>
          <StakingInfoRowContainer>
            <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.staked')}</Base1000Text>
            <AmountContainer>
              <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
                {stakedAmount}
              </BalanceDisplay>
              &nbsp;
              <Base1300Text variant="b4_M">{symbol}</Base1300Text>
            </AmountContainer>
          </StakingInfoRowContainer>
          {!isHideReward && (
            <StakingInfoRowContainer>
              <Base1000Text variant="b3_R">
                {`${t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.reward')} ${rewardCounts ? `+ ${rewardCounts}` : ''}`}
              </Base1000Text>
              <AmountContainer>
                <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
                  {rewardAmount}
                </BalanceDisplay>
                &nbsp;
                <Base1300Text variant="b4_M">{symbol}</Base1300Text>
              </AmountContainer>
            </StakingInfoRowContainer>
          )}
        </StakingInfoContainer>
      </StyledButton>
      <StakingOptionBottomSheet
        validatorName={validatorName}
        validatorImage={validatorImage}
        status={status}
        open={isOpenStakingOptionBottomSheet}
        onClose={() => setIsOpenStakingOptionBottomSheet(false)}
      >
        <BaseOptionButton
          onClick={() => {
            navigate({
              to: Stake.to,
              params: {
                coinId: stakingCoinId,
                validatorAddress: validatorAddress,
              },
            });
            setIsOpenStakingOptionBottomSheet(false);
          }}
          leftSecondHeader={
            <Base1300Text variant="b2_M">{t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.stake')}</Base1300Text>
          }
          leftSecondBody={
            <Base1000Text variant="b4_R">{t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.stakeDescription')}</Base1000Text>
          }
        />
        <BaseOptionButton
          onClick={() => {
            navigate({
              to: Unstake.to,
              params: {
                coinId: stakingCoinId,
                validatorAddress: validatorAddress,
              },
            });
            setIsOpenStakingOptionBottomSheet(false);
          }}
          leftSecondHeader={
            <Base1300Text variant="b2_M">{t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.unstake')}</Base1300Text>
          }
          leftSecondBody={
            <Base1000Text variant="b4_R">
              {t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.unstakeDescription')}
            </Base1000Text>
          }
        />
        <BaseOptionButton
          style={{
            display: isHideReward ? 'none' : 'null',
          }}
          onClick={() => {
            navigate({
              to: ClaimRewards.to,
              params: {
                coinId: stakingCoinId,
                validatorAddress: validatorAddress,
              },
            });
            setIsOpenStakingOptionBottomSheet(false);
          }}
          leftSecondHeader={
            <Base1300Text variant="b2_M">{t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.claimRewards')}</Base1300Text>
          }
          leftSecondBody={
            <Base1000Text variant="b4_R">
              {t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.claimRewardsDescription')}
            </Base1000Text>
          }
        />
        <BaseOptionButton
          style={{
            display: 'none',
          }}
          onClick={() => {
            setIsOpenStakingOptionBottomSheet(false);
          }}
          leftSecondHeader={
            <Base1300Text variant="b2_M">{t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.compounding')}</Base1300Text>
          }
          leftSecondBody={
            <Base1000Text variant="b4_R">
              {t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.compoundingDescription')}
            </Base1000Text>
          }
        />
      </StakingOptionBottomSheet>
    </>
  );
}
