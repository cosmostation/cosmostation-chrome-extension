import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';
import NumberTypo from '@/components/common/NumberTypo';
import { plus, toDisplayDenomAmount } from '@/utils/numbers';
import { shorterAddress } from '@/utils/string';

import {
  AmountContainer,
  CommissionContainer,
  ImageContainer,
  LabelAttributeText,
  LabelLeftContainer,
  StakingInfoContainer,
  StakingInfoDetailContainer,
  StakingInfoRowContainer,
  StyledButton,
  TopContainer,
  TopLeftContainer,
  TopLeftContentsContainer,
  ValidatorNameContainer,
  ValueAttributeText,
} from './styled';

import ClassificationIcon from '@/assets/images/icons/Classification10.svg';
import PendingClockIcon from '@/assets/images/icons/PendingClock40.svg';

type PendingItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  validatorName: string;
  objectId: string;
  symbol: string;
  decimals: number;
  stakedAmount: string;
  earnedAmount: string;
  startEarningEpoch: string;
  validatorImage?: string;
};

export default function PendingItem({
  validatorName,
  objectId,
  symbol,
  decimals,
  stakedAmount,
  earnedAmount,
  startEarningEpoch,
  validatorImage,
  ...remainder
}: PendingItemProps) {
  const { t } = useTranslation();

  const shortedObjectId = shorterAddress(objectId, 15);

  const displayStakedAmount = toDisplayDenomAmount(stakedAmount, decimals);
  const displayEarnedAmount = toDisplayDenomAmount(earnedAmount, decimals);
  const totalStakedAmount = plus(displayStakedAmount, displayEarnedAmount);

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
                {t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.PendingItem.index.objectId', {
                  objectId: shortedObjectId,
                })}
              </Base1000Text>
            </CommissionContainer>
          </TopLeftContainer>
        </TopLeftContentsContainer>
        <PendingClockIcon />
      </TopContainer>
      <StakingInfoContainer>
        <StakingInfoRowContainer>
          <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.PendingItem.index.totalStaked')}</Base1000Text>
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
                {t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.PendingItem.index.staked')}
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
                {t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.PendingItem.index.earned')}
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
          <Base1000Text variant="b3_R">{t('pages.coin-detail.$coinId.manage-stake.Entry.Sui.components.PendingItem.index.startEarning')}</Base1000Text>
          <Base1300Text variant="b3_M">
            Epoch &nbsp;
            <Base1300Text variant="h6n_M">{`#${startEarningEpoch}`}</Base1300Text>
          </Base1300Text>
        </StakingInfoRowContainer>
      </StakingInfoContainer>
    </StyledButton>
  );
}
