import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import Image from '@/components/common/Image';
import NumberTypo from '@/components/common/NumberTypo';
import { Route as Stake } from '@/pages/wallet/stake/$coinId/$validatorAddress';
import { Route as Unstake } from '@/pages/wallet/unstake/$coinId/$validatorAddress';
import { plus, toDisplayDenomAmount } from '@/utils/numbers';
import { shorterAddress } from '@/utils/string';

import {
  AmountContainer,
  CommissionContainer,
  ImageContainer,
  LabelAttributeText,
  LabelLeftContainer,
  RightChevronIconContainer,
  StakingInfoContainer,
  StakingInfoDetailContainer,
  StakingInfoRowContainer,
  StyledButton,
  TopContainer,
  TopLeftContainer,
  ValidatorNameContainer,
  ValueAttributeText,
} from './styled';
import StakingOptionBottomSheet from '../../../components/StakingOptionBottomSheet';

import ClassificationIcon from '@/assets/images/icons/Classification10.svg';
import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type StakingItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  stakingCoinId: string;
  validatorName: string;
  validatorAddress: string;
  objectId: string;
  symbol: string;
  decimals: number;
  stakedAmount: string;
  earnedAmount: string;
  startEarningEpoch: string;
  validatorImage?: string;
};

export default function StakingItem({
  stakingCoinId,
  validatorName,
  validatorAddress,
  objectId,
  symbol,
  decimals,
  stakedAmount,
  earnedAmount,
  startEarningEpoch,
  validatorImage,
  ...remainder
}: StakingItemProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const shortedObjectId = shorterAddress(objectId, 15);
  const [isOpenStakingOptionBottomSheet, setIsOpenStakingOptionBottomSheet] = useState(false);

  const displayStakedAmount = toDisplayDenomAmount(stakedAmount, decimals);
  const displayEarnedAmount = toDisplayDenomAmount(earnedAmount, decimals);
  const totalStakedAmount = plus(displayStakedAmount, displayEarnedAmount);

  return (
    <>
      <StyledButton type="button" {...remainder} onClick={() => setIsOpenStakingOptionBottomSheet(true)}>
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
                {t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.StakingItem.index.objectId', {
                  objectId: shortedObjectId,
                })}
              </Base1000Text>
            </CommissionContainer>
          </TopLeftContainer>
        </TopContainer>
        <StakingInfoContainer>
          <StakingInfoRowContainer>
            <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.StakingItem.index.totalStaked')}</Base1000Text>
            <AmountContainer>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimals}>
                {totalStakedAmount}
              </NumberTypo>
              &nbsp;
              <Base1300Text variant="h5n_M">{symbol}</Base1300Text>
            </AmountContainer>
          </StakingInfoRowContainer>

          <StakingInfoDetailContainer>
            <StakingInfoRowContainer>
              <LabelLeftContainer>
                <ClassificationIcon />
                <LabelAttributeText variant="b4_R">
                  {t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.StakingItem.index.staked')}
                </LabelAttributeText>
              </LabelLeftContainer>

              <ValueAttributeText>
                <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimals}>
                  {displayStakedAmount}
                </NumberTypo>
                &nbsp;
                <Typography variant="h8n_M">{symbol}</Typography>
              </ValueAttributeText>
            </StakingInfoRowContainer>

            <StakingInfoRowContainer>
              <LabelLeftContainer>
                <ClassificationIcon />
                <LabelAttributeText variant="b4_R">
                  {t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.StakingItem.index.earned')}
                </LabelAttributeText>
              </LabelLeftContainer>

              <ValueAttributeText>
                <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimals}>
                  {displayEarnedAmount}
                </NumberTypo>
                &nbsp;
                <Typography variant="h8n_M">{symbol}</Typography>
              </ValueAttributeText>
            </StakingInfoRowContainer>
          </StakingInfoDetailContainer>

          <StakingInfoRowContainer>
            <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.StakingItem.index.startEarning')}</Base1000Text>
            <Base1300Text variant="b3_M">
              Epoch &nbsp;
              <Base1300Text variant="h6n_M">{`#${startEarningEpoch}`}</Base1300Text>
            </Base1300Text>
          </StakingInfoRowContainer>
        </StakingInfoContainer>
      </StyledButton>
      <StakingOptionBottomSheet
        validatorName={validatorName}
        validatorImage={validatorImage}
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
            <Base1300Text variant="b2_M">{t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.StakingItem.index.stake')}</Base1300Text>
          }
          leftSecondBody={
            <Base1000Text variant="b4_R">{t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.StakingItem.index.stakeDescription')}</Base1000Text>
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
              search: {
                objectId: objectId,
              },
            });
            setIsOpenStakingOptionBottomSheet(false);
          }}
          leftSecondHeader={
            <Base1300Text variant="b2_M">{t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.StakingItem.index.unstake')}</Base1300Text>
          }
          leftSecondBody={
            <Base1000Text variant="b4_R">{t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.StakingItem.index.unstakeDescription')}</Base1000Text>
          }
        />
      </StakingOptionBottomSheet>
    </>
  );
}
