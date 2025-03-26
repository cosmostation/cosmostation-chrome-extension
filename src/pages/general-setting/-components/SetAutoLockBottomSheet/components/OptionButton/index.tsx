import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import { NEVER_LOCK_KEY } from '@/constants/autoLock';
import type { LockupTimeOptions } from '@/types/autoLock';

import { ActiveBadge, NeverContainer, RedText, StyledOptionButton } from './styled';

import CheckIcon from 'assets/images/icons/Check.svg';

type OptionButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  lockupOption: LockupTimeOptions;
  isActive?: boolean;
  onClickButton: (val: LockupTimeOptions) => void;
};

export default function OptionButton({ lockupOption, isActive, onClickButton, ...remainder }: OptionButtonProps) {
  const { t } = useTranslation();

  return (
    <StyledOptionButton
      onClick={() => {
        onClickButton?.(lockupOption);
      }}
      {...remainder}
    >
      {lockupOption === NEVER_LOCK_KEY ? (
        <NeverContainer>
          <Base1300Text variant="b2_M">{t('pages.general-setting.components.SetAutoLockBottomSheet.components.OptionButton.index.never')}</Base1300Text>
          <RedText variant="b4_R">{t('pages.general-setting.components.SetAutoLockBottomSheet.components.OptionButton.index.notRecommended')}</RedText>
        </NeverContainer>
      ) : (
        <Base1300Text variant="b2_M">
          {t('pages.general-setting.components.SetAutoLockBottomSheet.components.OptionButton.index.minutes', {
            minutes: lockupOption,
          })}
        </Base1300Text>
      )}
      {isActive && (
        <ActiveBadge>
          <CheckIcon />
        </ActiveBadge>
      )}
    </StyledOptionButton>
  );
}
