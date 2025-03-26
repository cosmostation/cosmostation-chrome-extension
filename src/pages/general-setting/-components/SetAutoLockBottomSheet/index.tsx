import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import { LOCK_UP_TIME_OPTIONS, NEVER_LOCK_KEY } from '@/constants/autoLock';
import type { LockupTimeOptions } from '@/types/autoLock';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import OptionButton from './components/OptionButton';
import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type SetAutoLockBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'>;

export default function SetAutoLockBottomSheet({ onClose, ...remainder }: SetAutoLockBottomSheetProps) {
  const { t } = useTranslation();

  const { autoLockTimeInMinutes, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const onHandleClick = (val: LockupTimeOptions) => {
    if (val === NEVER_LOCK_KEY) {
      updateExtensionStorageStore('autoLockTimeStampAt', null);
    }

    updateExtensionStorageStore('autoLockTimeInMinutes', val);

    onClose?.({}, 'backdropClick');
  };

  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        onClose?.({}, 'backdropClick');
      }}
    >
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{t('pages.general-setting.components.SetAutoLockBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'escapeKeyDown');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          {LOCK_UP_TIME_OPTIONS.map((item) => {
            const isActive = autoLockTimeInMinutes === item;

            return (
              <OptionButton
                key={item}
                lockupOption={item}
                isActive={isActive}
                onClickButton={(val) => {
                  onHandleClick(val);
                }}
              />
            );
          })}
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
