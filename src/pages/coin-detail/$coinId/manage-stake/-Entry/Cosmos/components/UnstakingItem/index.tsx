import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import { Route as CancelUnstake } from '@/pages/wallet/cancel-unstaking/$coinId';
import type { ValidatorStatus } from '@/types/cosmos/validator';
import { formatDateForUnstakingEndDate, getDDay } from '@/utils/date';

import {
  AmountContainer,
  RightChevronIconContainer,
  StakingInfoContainer,
  StakingInfoRowContainer,
  StyledButton,
  StyledValidatorImage,
  TopContainer,
  TopLeftContainer,
  TopRightContainer,
  ValidatorNameContainer,
  ValidatorNameWrapper,
} from './styled';
import StakingOptionBottomSheet from '../../../components/StakingOptionBottomSheet';

import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type UnStakingItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  stakingCoinId: string;
  validatorAddress: string;
  creationHeight: string;
  baseUnstakingAmount: string;
  validatorName: string;
  symbol: string;
  decimals: number;
  unstakingAmount: string;
  unstakingCompletionTime: string;
  validatorImage?: string;
  status?: ValidatorStatus;
};

export default function UnstakingItem({
  stakingCoinId,
  validatorAddress,
  creationHeight,
  baseUnstakingAmount,
  validatorName,
  symbol,
  unstakingAmount,
  unstakingCompletionTime,
  validatorImage,
  status,
  ...remainder
}: UnStakingItemProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isOpenStakingOptionBottomSheet, setIsOpenStakingOptionBottomSheet] = useState(false);

  const dday = getDDay(unstakingCompletionTime);

  const formattedEndDate = formatDateForUnstakingEndDate(unstakingCompletionTime);

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
          <TopLeftContainer>
            <StyledValidatorImage imageURL={validatorImage} status={status} />
            <ValidatorNameWrapper>
              <ValidatorNameContainer>
                <Base1300Text variant="b2_M">{validatorName}</Base1300Text>
              </ValidatorNameContainer>
              <RightChevronIconContainer>
                <RightChevronIcon />
              </RightChevronIconContainer>
            </ValidatorNameWrapper>
          </TopLeftContainer>
          <TopRightContainer>
            <Base1000Text variant="h6n_M">{`D-${dday}`}</Base1000Text>
            <Base1000Text variant="h7n_R">{formattedEndDate}</Base1000Text>
          </TopRightContainer>
        </TopContainer>
        <StakingInfoContainer>
          <StakingInfoRowContainer>
            <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.UnstakingItem.index.unstaking')}</Base1000Text>
            <AmountContainer>
              <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
                {unstakingAmount}
              </BalanceDisplay>
              &nbsp;
              <Base1300Text variant="b4_M">{symbol}</Base1300Text>
            </AmountContainer>
          </StakingInfoRowContainer>
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
              to: CancelUnstake.to,
              params: {
                coinId: stakingCoinId,
              },
              search: {
                validatorAddress: validatorAddress,
                amount: baseUnstakingAmount,
                creationHeight: creationHeight,
              },
            });
            setIsOpenStakingOptionBottomSheet(false);
          }}
          leftSecondHeader={
            <Base1300Text variant="b2_M">
              {t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.UnstakingItem.index.cancelUnstaking')}
            </Base1300Text>
          }
          leftSecondBody={
            <Base1000Text variant="b4_R">
              {t('pages.coin-detail.$coinId.manage-stake.Entry.Cosmos.components.UnstakingItem.index.cancelUnstakingDescription')}
            </Base1000Text>
          }
        />
      </StakingOptionBottomSheet>
    </>
  );
}
