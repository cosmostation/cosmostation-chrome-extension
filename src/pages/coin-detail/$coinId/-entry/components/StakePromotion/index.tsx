import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';

import { IconContainer, StyledButton, SubTitleContainer, SubTitleText, TitleTextContainer } from './styled';

import RightArrow from '@/assets/images/icons/RightArrow14.svg';

type StakePromotionProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  symbol: string;
  apr?: string;
};

export default function StakePromotion({ symbol, apr, ...remainer }: StakePromotionProps) {
  const { t } = useTranslation();

  const title = apr
    ? t('pages.coin-detail.components.StakePromotion.index.titleWithApr', {
        apr: apr,
        symbol: symbol,
      })
    : t('pages.coin-detail.components.StakePromotion.index.title', {
        symbol: symbol,
      });

  return (
    <StyledButton {...remainer}>
      <TitleTextContainer>
        <Base1300Text variant="h3_B">{title}</Base1300Text>
      </TitleTextContainer>

      <SubTitleContainer>
        <SubTitleText variant="b2_M">{t('pages.coin-detail.components.StakePromotion.index.stake')}</SubTitleText>
        <IconContainer>
          <RightArrow />
        </IconContainer>
      </SubTitleContainer>
    </StyledButton>
  );
}
