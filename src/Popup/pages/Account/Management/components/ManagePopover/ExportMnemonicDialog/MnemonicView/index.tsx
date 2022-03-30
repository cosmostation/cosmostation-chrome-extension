import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';

import DialogHeader from './Header';
import {
  ButtonContainer,
  Container,
  MnemonicContainer,
  MnemonicWordContainer,
  MnemonicWordNumberContainer,
  MnemonicWordTextContainer,
  StyledButton,
} from './styled';

type MnemonicViewProps = {
  onClose?: DialogProps['onClose'];
  mnemonic: string;
};

export default function MnemonicView({ onClose, mnemonic }: MnemonicViewProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const handleOnCopy = () => {
    if (copy(mnemonic)) {
      enqueueSnackbar(t('pages.Account.Management.components.ManagePopover.ExportMnemonicDialog.MnemonicView.index.copied'));
    }
  };

  const splitedMnemonic = mnemonic.split(' ');
  return (
    <>
      <DialogHeader onClick={handleOnCopy}>{t('pages.Account.Management.components.ManagePopover.ExportMnemonicDialog.MnemonicView.index.title')}</DialogHeader>
      <Container>
        <MnemonicContainer>
          {splitedMnemonic.map((word, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <MnemonicWordContainer key={`${word}${index}`}>
              <MnemonicWordNumberContainer>
                <Typography variant="h5">{index + 1}</Typography>
              </MnemonicWordNumberContainer>
              <MnemonicWordTextContainer>
                <Typography variant="h5">{word}</Typography>
              </MnemonicWordTextContainer>
            </MnemonicWordContainer>
          ))}
        </MnemonicContainer>
        <ButtonContainer>
          <StyledButton type="button" onClick={() => onClose?.({}, 'backdropClick')}>
            {t('pages.Account.Management.components.ManagePopover.ExportMnemonicDialog.MnemonicView.index.done')}
          </StyledButton>
        </ButtonContainer>
      </Container>
    </>
  );
}
