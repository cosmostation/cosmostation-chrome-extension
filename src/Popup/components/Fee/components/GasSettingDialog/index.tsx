import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import type { DialogProps } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { Container, InputContainer, StyledButton, StyledInput } from './styled';
import type { GasForm } from './useSchema';
import { useSchema } from './useSchema';

type GasSettingDialogProps = Omit<DialogProps, 'children'> & {
  onSubmitGas?: (data: GasForm) => void;
  currentGas?: string;
};

export default function GasSettingDialog({ onClose, onSubmitGas, currentGas, ...remainder }: GasSettingDialogProps) {
  const { gasForm } = useSchema();

  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<GasForm>({
    resolver: joiResolver(gasForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const handleOnClose = () => {
    reset();
    onClose?.({}, 'backdropClick');
  };

  const submit = (data: GasForm) => {
    onSubmitGas?.(data);
    handleOnClose();
  };

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose}>{t('components.Fee.components.GasSettingDialog.index.gasSettings')}</DialogHeader>
      <form onSubmit={handleSubmit(submit)}>
        <Container>
          <InputContainer>
            <StyledInput
              inputProps={register('gas')}
              type="number"
              placeholder={`${currentGas || '0'}`}
              error={!!errors.gas}
              helperText={errors.gas?.message}
            />
          </InputContainer>
          <StyledButton type="submit" disabled={!isDirty}>
            {t('components.Fee.components.GasSettingDialog.index.submitButton')}
          </StyledButton>
        </Container>
      </form>
    </Dialog>
  );
}
