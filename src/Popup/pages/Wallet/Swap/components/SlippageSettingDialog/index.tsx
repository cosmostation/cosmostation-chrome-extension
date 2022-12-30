import type { DialogProps } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { Container, StyledButton } from './styled';

type SlippageSettingDialogProps = Omit<DialogProps, 'children'> & {
  onSubmitSlippage?: (slippage: string) => void;
};

export default function SlippageSettingDialog({ onClose, ...remainder }: SlippageSettingDialogProps) {
  const { t } = useTranslation();

  const handleOnClose = () => {
    onClose?.({}, 'backdropClick');
  };

  // const submit = (slippage: string) => {
  //   onSubmitSlippage?.(slippage);
  //   handleOnClose();
  // };

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose}>{t('pages.Wallet.Swap.components.SlippageSettingDialog.title')}</DialogHeader>
      <Container>
        <StyledButton onClick={handleOnClose}>{t('pages.Wallet.Swap.components.SlippageSettingDialog.confirm')}</StyledButton>
      </Container>
    </Dialog>
  );
}
