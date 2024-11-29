import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import StandardInput from '@/components/common/StandardInput';

import { Body, ConfirmButton, Container, DescriptionText, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type SetAccountNameBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentAccountName?: string;
  setAccountName?: (accountName: string) => void;
};

export default function SetAccountNameBottomSheet({ currentAccountName, setAccountName, onClose, ...remainder }: SetAccountNameBottomSheetProps) {
  const { t } = useTranslation();

  const [inputAccountName, setInputAccountName] = useState(currentAccountName || '');

  // TODO joi로 변경 필요
  const errorMsg = (() => {
    if (!inputAccountName) {
      return t('components.SetAccountNameBottomSheet.index.emptyAccountNmae');
    }
  })();

  const onHandleSetAccountName = (accountName: string) => {
    setAccountName?.(accountName);
  };

  const onHandleClose = () => {
    if (errorMsg) {
      return;
    }

    setInputAccountName('');
    onClose?.({}, 'backdropClick');
  };

  const confirm = () => {
    onHandleSetAccountName?.(inputAccountName);
    onHandleClose();
  };

  return (
    <StyledBottomSheet {...remainder} onClose={onHandleClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h3_B">{t('components.SetAccountNameBottomSheet.index.header')}</Typography>
          </HeaderTitle>
          <StyledButton onClick={onHandleClose}>
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <DescriptionText variant="b3_R_Multiline">{t('components.SetAccountNameBottomSheet.index.description')}</DescriptionText>
          <StandardInput
            label={t('components.SetAccountNameBottomSheet.index.accountName')}
            onChange={(e) => setInputAccountName(e.currentTarget.value)}
            value={inputAccountName}
            error={!!errorMsg}
            helperText={errorMsg}
          />

          <ConfirmButton onClick={confirm} disabled={!!errorMsg}>
            {t('components.SetAccountNameBottomSheet.index.setUpComplete')}
          </ConfirmButton>
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
