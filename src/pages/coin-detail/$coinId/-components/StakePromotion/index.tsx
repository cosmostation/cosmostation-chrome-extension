import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';

import { IconContainer, StyledButton, SubTitleContainer, SubTitleText } from './styled';

import RightArrow from '@/assets/images/icons/RightArrow14.svg';

type StakePromotionProps = {
  symbol: string;
  // navigateTo: string;
};

export default function StakePromotion({ symbol }: StakePromotionProps) {
  const { t } = useTranslation();

  return (
    <StyledButton>
      <Base1300Text variant="h3_B">{t('pages.coin-detail.components.StakePromotion.index.title').replace('${symbol}', symbol)}</Base1300Text>

      <SubTitleContainer>
        <SubTitleText variant="b2_M">{t('pages.coin-detail.components.StakePromotion.index.stake')}</SubTitleText>
        <IconContainer>
          <RightArrow />
        </IconContainer>
      </SubTitleContainer>
    </StyledButton>
  );
}
