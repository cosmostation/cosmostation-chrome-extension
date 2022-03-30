import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import type { DialogProps } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';

import DialogHeader from './Header';
import { Container, StyledButton, StyledInput } from './styled';

type PrivateKeyViewProps = {
  onClose?: DialogProps['onClose'];
  privateKey: string;
};

export default function PrivateKeyView({ onClose, privateKey }: PrivateKeyViewProps) {
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const handleOnCopy = () => {
    if (copy(privateKey)) {
      enqueueSnackbar(t('pages.Account.Management.components.ManagePopover.ExportPrivateKeyDialog.PrivateKeyView.index.copied'));
    }
  };
  return (
    <>
      <DialogHeader onClick={handleOnCopy}>
        {t('pages.Account.Management.components.ManagePopover.ExportPrivateKeyDialog.PrivateKeyView.index.title')}
      </DialogHeader>
      <Container>
        <StyledInput type="text" value={privateKey} multiline readOnly onClick={handleOnCopy} />
        <StyledButton type="button" onClick={() => onClose?.({}, 'backdropClick')}>
          {t('pages.Account.Management.components.ManagePopover.ExportPrivateKeyDialog.PrivateKeyView.index.done')}
        </StyledButton>
      </Container>
    </>
  );
}
