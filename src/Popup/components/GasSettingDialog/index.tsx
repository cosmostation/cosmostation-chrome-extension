import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { LineType } from '~/types/chain';

import { Container, InputContainer, LabelButton, LabelContainer, LabelText, StyledButton, StyledInput } from './styled';
import type { GasForm } from './useSchema';
import { useSchema } from './useSchema';

import Info16Icon from '~/images/icons/Info16.svg';

type GasSettingDialogProps = Omit<DialogProps, 'children'> & {
  onSubmitGas?: (data: GasForm) => void;
  currentGas?: string;
  min?: number;
  line?: LineType;
};

export default function GasSettingDialog({ onClose, onSubmitGas, currentGas, min = 0, line, ...remainder }: GasSettingDialogProps) {
  const { gasForm } = useSchema();
  const gasFormSchema = gasForm(min);

  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<GasForm>({
    resolver: joiResolver(gasFormSchema),
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
          {line === 'ETHEREUM' && (
            <LabelContainer>
              <LabelText>
                <Typography variant="h6">Gas limit</Typography>
              </LabelText>
              <Tooltip
                title="Gas limit is the maximum units of gas you are willing to use. Units of gas are a multiplier to “Max priority fee” and “Max fee”."
                arrow
              >
                <LabelButton type="button">
                  <Info16Icon />
                </LabelButton>
              </Tooltip>
            </LabelContainer>
          )}
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
