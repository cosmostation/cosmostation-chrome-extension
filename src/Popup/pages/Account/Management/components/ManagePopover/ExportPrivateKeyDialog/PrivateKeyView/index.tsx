import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import type { DialogProps } from '@mui/material';

import DialogHeader from './Header';
import { Container, StyledButton, StyledInput } from './styled';

type PrivateKeyViewProps = {
  onClose?: DialogProps['onClose'];
  privateKey: string;
};

export default function PrivateKeyView({ onClose, privateKey }: PrivateKeyViewProps) {
  const { enqueueSnackbar } = useSnackbar();

  const handleOnCopy = () => {
    if (copy(privateKey)) {
      enqueueSnackbar(`copied!`);
    }
  };
  return (
    <>
      <DialogHeader onClick={handleOnCopy}>View Private Key</DialogHeader>
      <Container>
        <StyledInput type="text" value={privateKey} multiline readOnly onClick={handleOnCopy} />
        <StyledButton type="button" onClick={() => onClose?.({}, 'backdropClick')}>
          Done
        </StyledButton>
      </Container>
    </>
  );
}
