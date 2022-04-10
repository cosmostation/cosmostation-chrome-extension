import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { Container, WarningDescriptionContainer, WarningImageContainer, WarningTitleContainer } from './styled';

import MnemonicWarningIcon from '~/images/icons/MnemonicWarning.svg';

type LostDialogProps = Omit<DialogProps, 'children'>;

export default function LostDialog({ onClose, ...remainder }: LostDialogProps) {
  const { t } = useTranslation();
  const handleOnClose = () => {
    onClose?.({}, 'backdropClick');
  };

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose} />
      <Container>
        <WarningImageContainer>
          <MnemonicWarningIcon />
        </WarningImageContainer>
        <WarningTitleContainer>
          <Typography variant="h3">{t('components.Lock.LostDialog.index.title')}</Typography>
        </WarningTitleContainer>
        <WarningDescriptionContainer>
          <Typography variant="h6">{t('components.Lock.LostDialog.index.description')}</Typography>
        </WarningDescriptionContainer>
      </Container>
    </Dialog>
  );
}
