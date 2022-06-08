import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { toDisplayDenomAmount } from '~/Popup/utils/big';

import { Container, InputContainer, LabelButton, LabelContainer, LabelText, StyledButton, StyledInput } from './styled';
import type { GasPriceForm } from './useSchema';
import { useSchema } from './useSchema';

import Info16Icon from '~/images/icons/Info16.svg';

type GasPriceDialogProps = Omit<DialogProps, 'children'> & {
  onSubmitGas?: (data: GasPriceForm) => void;
  currentGasPrice?: string;
};

export default function GasPriceDialog({ onClose, onSubmitGas, currentGasPrice, ...remainder }: GasPriceDialogProps) {
  const { gasPriceForm } = useSchema();

  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<GasPriceForm>({
    resolver: joiResolver(gasPriceForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const handleOnClose = () => {
    reset();
    onClose?.({}, 'backdropClick');
  };

  const submit = (data: GasPriceForm) => {
    onSubmitGas?.(data);
    handleOnClose();
  };

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose}>{t('pages.Popup.Ethereum.SignTransaction.components.GasPriceDialog.index.gasPriceSetting')}</DialogHeader>
      <form onSubmit={handleSubmit(submit)}>
        <Container>
          <LabelContainer>
            <LabelText>
              <Typography variant="h6">Gas price (GWEI)</Typography>
            </LabelText>
            <Tooltip
              title="This network requires a “Gas price” field when submitting a transaction. Gas price is the amount you will pay pay per unit of gas."
              arrow
            >
              <LabelButton type="button">
                <Info16Icon />
              </LabelButton>
            </Tooltip>
          </LabelContainer>
          <InputContainer>
            <StyledInput
              inputProps={register('gasPrice')}
              type="text"
              placeholder={`${toDisplayDenomAmount(currentGasPrice || '0', 9)}`}
              error={!!errors.gasPrice}
              helperText={errors.gasPrice?.message}
            />
          </InputContainer>
          <StyledButton type="submit" disabled={!isDirty}>
            {t('pages.Popup.Ethereum.SignTransaction.components.GasPriceDialog.index.submitButton')}
          </StyledButton>
        </Container>
      </form>
    </Dialog>
  );
}
