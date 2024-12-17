import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import OptionButton from './components/OptionButton';
import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type LanguageBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'>;

export default function LanguageBottomSheet({ onClose, ...remainder }: LanguageBottomSheetProps) {
  const { t } = useTranslation();
  const i18 = useTranslation();

  const language = i18.i18n.language.trim();

  const supportLanguage = ['en'];

  const onHandleClick = (val: string) => {
    i18.i18n.changeLanguage(val);

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
          {supportLanguage.map((item) => {
            return (
              <OptionButton
                key={item}
                language={item}
                isActive={language.includes(item)}
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
