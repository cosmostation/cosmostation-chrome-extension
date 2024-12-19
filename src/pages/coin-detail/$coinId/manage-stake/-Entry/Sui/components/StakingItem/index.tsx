import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';
import NumberTypo from '@/components/common/NumberTypo';
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

import ClassificationIcon from '@/assets/images/icons/Classification10.svg';
import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type StakingItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  validatorName: string;
  objectId: string;
  symbol: string;
  decimals: number;
  totalStakedAmount: string;
  stakedAmount: string;
  earnedAmount: string;
  startEarningEpoch: string;
  validatorImage?: string;
};

export default function StakingItem({
  validatorName,
  objectId,
  symbol,
  decimals,
  totalStakedAmount,
  stakedAmount,
  earnedAmount,
  startEarningEpoch,
  validatorImage,
  ...remainder
}: StakingItemProps) {
  const { t } = useTranslation();

  const shortedObjectId = shorterAddress(objectId, 15);

  return (
    <StyledButton type="button" {...remainder}>
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
                {stakedAmount}
              </NumberTypo>
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
                {earnedAmount}
              </NumberTypo>
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
  );
}
