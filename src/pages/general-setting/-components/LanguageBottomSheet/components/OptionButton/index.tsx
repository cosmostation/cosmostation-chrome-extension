import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import type { LanguageType } from '@/types/language';

import { ActiveBadge, StyledOptionButton } from './styled';

import CheckIcon from 'assets/images/icons/Check.svg';

type OptionButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  language: LanguageType;
  isActive?: boolean;
  onClickButton: (val: LanguageType) => void;
};

export default function OptionButton({ language, isActive, onClickButton, ...remainder }: OptionButtonProps) {
  const { t } = useTranslation();

  const text = (() => {
    if (language === 'en') return t('pages.general-setting.components.LanguageBottomSheet.components.OptionButton.index.english');
    if (language === 'ko') return t('pages.general-setting.components.LanguageBottomSheet.components.OptionButton.index.korean');
  })();

  return (
    <StyledOptionButton
      onClick={() => {
        onClickButton?.(language);
      }}
      {...remainder}
    >
      <Base1300Text variant="b2_M"> {text}</Base1300Text>
      {isActive && (
        <ActiveBadge>
          <CheckIcon />
        </ActiveBadge>
      )}
    </StyledOptionButton>
  );
}
