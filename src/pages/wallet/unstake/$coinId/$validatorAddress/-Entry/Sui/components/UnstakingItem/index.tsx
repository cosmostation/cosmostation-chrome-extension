import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';
import NumberTypo from '@/components/common/NumberTypo';
import { shorterAddress } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AmountContainer,
  CommissionContainer,
  ImageContainer,
  LabelAttributeText,
  LabelLeftContainer,
  StakingInfoContainer,
  StakingInfoDetailContainer,
  StakingInfoRowContainer,
  StakingInfoTitleRowContainer,
  StakingInfoTitleRowRightContainer,
  StyledButton,
  TopContainer,
  TopLeftContainer,
  TopLeftContentsContainer,
  ValidatorNameContainer,
  ValueAttributeText,
} from './styled';

import ClassificationIcon from '@/assets/images/icons/Classification10.svg';

type UnstakingItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  validatorName: string;
  objectId: string;
  symbol: string;
  decimals: number;
  unstakedAmount: string;
  unstakedValue: string;
  stakedAmount: string;
  earnedAmount: string;
  validatorImage?: string;
};

// FIXME i18n 처리 필요
export default function UnstakingItem({
  validatorName,
  objectId,
  symbol,
  decimals,
  unstakedAmount,
  unstakedValue,
  stakedAmount,
  earnedAmount,
  validatorImage,
  ...remainder
}: UnstakingItemProps) {
  const { t } = useTranslation();

  const { currency } = useExtensionStorageStore((state) => state);

  const shortedObjectId = shorterAddress(objectId, 15);

  return (
    <StyledButton type="button" {...remainder} disabled>
      <TopContainer>
        <TopLeftContentsContainer>
          <ImageContainer>
            <Image src={validatorImage} />
          </ImageContainer>
          <TopLeftContainer>
            <ValidatorNameContainer>
              <Base1300Text variant="b2_M">{validatorName}</Base1300Text>
            </ValidatorNameContainer>
            <CommissionContainer>
              <Base1000Text variant="b4_R">
                {/* {t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.PendingItem.index.objectId', {
                  objectId: shortedObjectId,
                })} */}
                {`Object ID : ${shortedObjectId}`}
              </Base1000Text>
            </CommissionContainer>
          </TopLeftContainer>
        </TopLeftContentsContainer>
      </TopContainer>
      <StakingInfoContainer>
        <StakingInfoTitleRowContainer>
          <Base1000Text variant="b3_M">
            {
              // t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.PendingItem.index.totalStaked')
              'Amount to unstake'
            }
          </Base1000Text>
          <StakingInfoTitleRowRightContainer>
            <AmountContainer>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimals}>
                {unstakedAmount}
              </NumberTypo>
              &nbsp;
              <Base1300Text variant="h5n_M">{symbol}</Base1300Text>
            </AmountContainer>
            <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={currency}>
              {unstakedValue}
            </NumberTypo>
          </StakingInfoTitleRowRightContainer>
        </StakingInfoTitleRowContainer>

        <StakingInfoDetailContainer>
          <StakingInfoRowContainer>
            <LabelLeftContainer>
              <ClassificationIcon />
              <LabelAttributeText variant="b4_R">
                {t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.PendingItem.index.staked')}
              </LabelAttributeText>
            </LabelLeftContainer>

            <ValueAttributeText>
              <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimals}>
                {stakedAmount}
              </NumberTypo>
            </ValueAttributeText>
          </StakingInfoRowContainer>

          <StakingInfoRowContainer>
            <LabelLeftContainer>
              <ClassificationIcon />
              <LabelAttributeText variant="b4_R">
                {t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.PendingItem.index.earned')}
              </LabelAttributeText>
            </LabelLeftContainer>

            <ValueAttributeText>
              <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimals}>
                {earnedAmount}
              </NumberTypo>
            </ValueAttributeText>
          </StakingInfoRowContainer>
        </StakingInfoDetailContainer>
      </StakingInfoContainer>
    </StyledButton>
  );
}
