import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { PRICE_TREND_TYPE } from '@/constants/price';
import type { PriceTrendType } from '@/types/price';

import { ActiveBadge, LeftContainer, LeftTextContainer, StyledOptionButton } from './styled';

import CheckIcon from 'assets/images/icons/Check.svg';
import GreenUpIcon from 'assets/images/icons/GreenUp28.svg';
import RedUpIcon from 'assets/images/icons/RedUp28.svg';

type OptionButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  priceTrend: PriceTrendType;
  isActive?: boolean;
  onClickButton: (val: PriceTrendType) => void;
};

export default function OptionButton({ priceTrend, isActive, onClickButton, ...remainder }: OptionButtonProps) {
  const { t } = useTranslation();

  return (
    <StyledOptionButton
      onClick={() => {
        onClickButton?.(priceTrend);
      }}
      {...remainder}
    >
      <LeftContainer>
        {priceTrend === PRICE_TREND_TYPE.GREEN_UP ? <GreenUpIcon /> : <RedUpIcon />}
        <LeftTextContainer>
          <Base1300Text variant="b2_M">
            {priceTrend === PRICE_TREND_TYPE.GREEN_UP
              ? t('pages.general-setting.components.PriceColorSettionBottomSheet.components.OptionButton.index.style1')
              : t('pages.general-setting.components.PriceColorSettionBottomSheet.components.OptionButton.index.style2')}
          </Base1300Text>
          <Base1000Text variant="b4_R">
            {priceTrend === PRICE_TREND_TYPE.GREEN_UP
              ? t('pages.general-setting.components.PriceColorSettionBottomSheet.components.OptionButton.index.style1Description')
              : t('pages.general-setting.components.PriceColorSettionBottomSheet.components.OptionButton.index.style2escription')}
          </Base1000Text>
        </LeftTextContainer>
      </LeftContainer>
      {isActive && (
        <ActiveBadge>
          <CheckIcon />
        </ActiveBadge>
      )}
    </StyledOptionButton>
  );
}
