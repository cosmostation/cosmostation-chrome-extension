import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import { LANGUAGE_TYPE } from '@/constants/language';
import type { LanguageType } from '@/types/language';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import OptionButton from './components/OptionButton';
import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type LanguageBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'>;

export default function LanguageBottomSheet({ onClose, ...remainder }: LanguageBottomSheetProps) {
  const { t, i18n } = useTranslation();

  const { updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const onHandleClick = (val: LanguageType) => {
    i18n.changeLanguage(val);
    updateExtensionStorageStore('userLanguagePreference', val);
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
            <Typography variant="h2_B">{t('pages.general-setting.components.LanguageBottomSheet.index.title')}</Typography>
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
          {Object.values(LANGUAGE_TYPE).map((item) => {
            return (
              <OptionButton
                key={item}
                language={item}
                isActive={i18n.resolvedLanguage === item}
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
