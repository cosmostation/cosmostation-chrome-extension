import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import Image from '@/components/common/Image';
import NumberTypo from '@/components/common/NumberTypo';
import { Route as Stake } from '@/pages/wallet/stake/$coinId/$validatorAddress';
import { Route as Unstake } from '@/pages/wallet/unstake/$coinId/$validatorAddress';

import {
  AmountContainer,
  CommissionContainer,
  ImageContainer,
  RightChevronIconContainer,
  StakingInfoContainer,
  StakingInfoRowContainer,
  StyledButton,
  TopContainer,
  TopLeftContainer,
  ValidatorNameContainer,
} from './styled';
import StakingOptionBottomSheet from '../../../components/StakingOptionBottomSheet';

import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type StakingItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  stakingCoinId: string;
  validatorAddress: string;
  validatorName: string;
  commission: string;
  symbol: string;
  decimals: number;
  stakedAmount: string;
  rewardAmount: string;
  rewardCounts: string;
  validatorImage?: string;
};

export default function StakingItem({
  stakingCoinId,
  validatorAddress,
  validatorName,
  commission,
  symbol,
  decimals,
  stakedAmount,
  rewardAmount,
  rewardCounts,
  validatorImage,
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
          <ImageContainer>
            <Image src={validatorImage} />
          </ImageContainer>
          <TopLeftContainer>
            <ValidatorNameContainer>
              <Base1300Text variant="b2_M">{validatorName}</Base1300Text>
              <RightChevronIconContainer>
                <RightChevronIcon />
              </RightChevronIconContainer>
            </ValidatorNameContainer>
            <CommissionContainer>
              <Base1000Text variant="b4_R">
                {`${t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.commission')} : `}
                <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h6n_M" fixed={2}>
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
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimals}>
                {stakedAmount}
              </NumberTypo>
              &nbsp;
              <Base1300Text variant="h5n_M">{symbol}</Base1300Text>
            </AmountContainer>
          </StakingInfoRowContainer>
          <StakingInfoRowContainer>
            <Base1000Text variant="b3_R">
              {t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.StakingItem.index.reward', {
                counts: rewardCounts,
              })}
            </Base1000Text>
            <AmountContainer>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimals}>
                {rewardAmount}
              </NumberTypo>
              &nbsp;
              <Base1300Text variant="h5n_M">{symbol}</Base1300Text>
            </AmountContainer>
          </StakingInfoRowContainer>
        </StakingInfoContainer>
      </StyledButton>
      <StakingOptionBottomSheet open={isOpenStakingOptionBottomSheet} onClose={() => setIsOpenStakingOptionBottomSheet(false)}>
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
          onClick={() => {
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
