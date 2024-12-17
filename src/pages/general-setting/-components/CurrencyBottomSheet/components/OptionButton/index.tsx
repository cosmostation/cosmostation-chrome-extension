import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';
import { CURRENCY_TYPE } from '@/constants/currency';
import type { CurrencyType } from '@/types/currency';

import { ActiveBadge, LeftContainer, LeftTextContainer, StyledOptionButton } from './styled';

import CheckIcon from 'assets/images/icons/Check.svg';

import CNImage from 'assets/images/country/china.png';
import EUImage from 'assets/images/country/euro.png';
import JPNImage from 'assets/images/country/japan.png';
import KRImage from 'assets/images/country/korea.png';
import USImage from 'assets/images/country/us.png';

type OptionButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  currency: CurrencyType;
  isActive?: boolean;
  onClickButton: (val: CurrencyType) => void;
};

export default function OptionButton({ currency, isActive, onClickButton, ...remainder }: OptionButtonProps) {
  const { t } = useTranslation();

  const country = (() => {
    if (currency === CURRENCY_TYPE.USD) return t('pages.general-setting.components.CurrencyBottomSheet.components.OptionButton.index.us');
    if (currency === CURRENCY_TYPE.KRW) return t('pages.general-setting.components.CurrencyBottomSheet.components.OptionButton.index.kr');
    if (currency === CURRENCY_TYPE.JPY) return t('pages.general-setting.components.CurrencyBottomSheet.components.OptionButton.index.jp');
    if (currency === CURRENCY_TYPE.CNY) return t('pages.general-setting.components.CurrencyBottomSheet.components.OptionButton.index.cn');
    if (currency === CURRENCY_TYPE.EUR) return t('pages.general-setting.components.CurrencyBottomSheet.components.OptionButton.index.eu');
  })();

  const img = (() => {
    if (currency === CURRENCY_TYPE.USD) return USImage;
    if (currency === CURRENCY_TYPE.KRW) return KRImage;
    if (currency === CURRENCY_TYPE.JPY) return JPNImage;
    if (currency === CURRENCY_TYPE.CNY) return CNImage;
    if (currency === CURRENCY_TYPE.EUR) return EUImage;
  })();

  return (
    <StyledOptionButton
      onClick={() => {
        onClickButton?.(currency);
      }}
      {...remainder}
    >
      <LeftContainer>
        <Image src={img} />
        <LeftTextContainer>
          <Base1300Text variant="b2_M">{currency.toUpperCase()}</Base1300Text>
          <Base1000Text variant="b4_R">{country}</Base1000Text>
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
