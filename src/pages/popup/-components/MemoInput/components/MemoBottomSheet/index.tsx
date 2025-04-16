import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import StandardInput from '@/components/common/StandardInput';

import { Body, ConfirmButton, Container, DescriptionText, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type MemoBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  currentMemo?: string;
  onChangeMemo?: (memo: string) => void;
};

export default function MemoBottomSheet({ currentMemo, onChangeMemo, onClose, ...remainder }: MemoBottomSheetProps) {
  const { t } = useTranslation();

  const [inputMemo, setInputMemo] = useState(currentMemo || '');

  const onHandleClose = () => {
    onClose?.({}, 'backdropClick');
  };

  return (
    <StyledBottomSheet {...remainder} onClose={onHandleClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{t('pages.popup.components.MemoInput.components.MemoBottomSheet.index.enterMemo')}</Typography>
          </HeaderTitle>
          <StyledButton onClick={onHandleClose}>
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <DescriptionText variant="b3_R_Multiline">{t('pages.popup.components.MemoInput.components.MemoBottomSheet.index.description')}</DescriptionText>
          <StandardInput
            label={t('pages.popup.components.MemoInput.components.MemoBottomSheet.index.memo')}
            value={inputMemo}
            multiline
            maxRows={3}
            onChange={(e) => setInputMemo(e.target.value)}
            sx={{
              marginBottom: '1.2rem',
            }}
          />

          <ConfirmButton
            onClick={() => {
              onChangeMemo?.(inputMemo);
              onHandleClose();
            }}
          >
            {t('pages.popup.components.MemoInput.components.MemoBottomSheet.index.confirm')}
          </ConfirmButton>
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
