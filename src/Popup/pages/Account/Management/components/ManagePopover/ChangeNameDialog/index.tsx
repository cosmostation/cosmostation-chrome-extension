import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { joiResolver } from '@hookform/resolvers/joi';
import type { DialogProps, PopoverProps } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { Account } from '~/types/chromeStorage';

import { Container, StyledButton, StyledInput } from './styled';
import type { ChangeNameForm } from './useSchema';
import { useSchema } from './useSchema';

type ChangeNameDialogProps = Omit<DialogProps, 'children'> & { account: Account; popoverOnClose?: PopoverProps['onClose'] };

export default function ChangeNameDialog({ onClose, account, ...remainder }: ChangeNameDialogProps) {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { enqueueSnackbar } = useSnackbar();

  const { accountName } = chromeStorage;

  const { changeNameForm } = useSchema();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ChangeNameForm>({
    resolver: joiResolver(changeNameForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const handleOnClose = () => {
    reset();
    onClose?.({}, 'backdropClick');
  };

  const submit = async (data: ChangeNameForm) => {
    await setChromeStorage('accountName', { ...accountName, [account.id]: data.name });
    enqueueSnackbar('success rename');
    handleOnClose();
  };

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose}>Rename account</DialogHeader>
      <Container>
        <form onSubmit={handleSubmit(submit)}>
          <StyledInput
            inputProps={register('name')}
            placeholder={account ? accountName[account.id] : ''}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <StyledButton type="submit" disabled={!isDirty}>
            Submit
          </StyledButton>
        </form>
      </Container>
    </Dialog>
  );
}
