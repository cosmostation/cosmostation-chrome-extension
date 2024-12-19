import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';
import NumberTypo from '@/components/common/NumberTypo';
import { formatDateForUnstakingEndDate, getDDay } from '@/utils/date';

import {
  AmountContainer,
  ImageContainer,
  RightChevronIconContainer,
  StakingInfoContainer,
  StakingInfoRowContainer,
  StyledButton,
  TopContainer,
  TopLeftContainer,
  TopRightContainer,
  ValidatorNameContainer,
} from './styled';

import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type UnStakingItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  validatorName: string;
  symbol: string;
  decimals: number;
  unstakingAmount: string;
  unstakingCompletionTime: string;
  validatorImage?: string;
};

export default function UnstakingItem({
  validatorName,
  symbol,
  decimals,
  unstakingAmount,
  unstakingCompletionTime,
  validatorImage,
  ...remainder
}: UnStakingItemProps) {
  const { t } = useTranslation();

  const dday = getDDay(unstakingCompletionTime);

  const formattedEndDate = formatDateForUnstakingEndDate(unstakingCompletionTime);

  return (
    <StyledButton type="button" {...remainder}>
      <TopContainer>
        <TopLeftContainer>
          <ImageContainer>
            <Image src={validatorImage} />
          </ImageContainer>
          <ValidatorNameContainer>
            <Base1300Text variant="b2_M">{validatorName}</Base1300Text>
            <RightChevronIconContainer>
              <RightChevronIcon />
            </RightChevronIconContainer>
          </ValidatorNameContainer>
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
            <NumberTypo typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={decimals}>
              {unstakingAmount}
            </NumberTypo>
            &nbsp;
            <Base1300Text variant="h5n_M">{symbol}</Base1300Text>
          </AmountContainer>
        </StakingInfoRowContainer>
      </StakingInfoContainer>
    </StyledButton>
  );
}
