import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import { ACCENT_COLORS } from '~/constants/theme';
import Dialog from '~/Popup/components/common/Dialog';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { ButtonContainer, Container, StyledButton, TextContainer } from './styled';

type ConfirmDialogDialogProps = Omit<DialogProps, 'children'> & { onClickSend?: () => void };

export default function ConfirmDialog({ onClose, onClickSend, ...remainder }: ConfirmDialogDialogProps) {
  const { t } = useTranslation();
  const handleOnClose = () => {
    onClose?.({}, 'backdropClick');
  };

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <Container>
        <TextContainer>
          <Typography variant="h4">{t('pages.Wallet.Send.Entry.Bitcoin.components.ConfirmDialog.index.confirmText')}</Typography>
        </TextContainer>
        <ButtonContainer>
          <StyledButton accentColor={ACCENT_COLORS.RED} hoverAccentColor={ACCENT_COLORS.RED} type="button" onClick={handleOnClose}>
            {t('pages.Wallet.Send.Entry.Bitcoin.components.ConfirmDialog.index.cancel')}
          </StyledButton>
          <StyledButton type="button" onClick={onClickSend}>
            {t('pages.Wallet.Send.Entry.Bitcoin.components.ConfirmDialog.index.confirm')}
          </StyledButton>
        </ButtonContainer>
      </Container>
    </Dialog>
  );
}
