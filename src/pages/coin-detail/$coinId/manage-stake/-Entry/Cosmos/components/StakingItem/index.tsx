import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';
import NumberTypo from '@/components/common/NumberTypo';

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

import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type StakingItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
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
            <NumberTypo typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={decimals}>
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
            <NumberTypo typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={decimals}>
              {rewardAmount}
            </NumberTypo>
            &nbsp;
            <Base1300Text variant="h5n_M">{symbol}</Base1300Text>
          </AmountContainer>
        </StakingInfoRowContainer>
      </StakingInfoContainer>
    </StyledButton>
  );
}
