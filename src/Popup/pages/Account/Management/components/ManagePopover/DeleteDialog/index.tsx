import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useSetRecoilState } from 'recoil';
import { joiResolver } from '@hookform/resolvers/joi';
import type { DialogProps, PopoverProps } from '@mui/material';
import { Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { disposableLoadingState } from '~/Popup/recoils/loading';
import { sha512 } from '~/Popup/utils/crypto';
import type { Account } from '~/types/extensionStorage';

import { Container, DescriptionContainer, DescriptionImageContainer, DescriptionTextContainer, StyledButton, StyledInput } from './styled';
import type { PasswordForm } from './useSchema';
import { useSchema } from './useSchema';

import Info16Icon from '~/images/icons/Info16.svg';

type ExportMnemonicDialogProps = Omit<DialogProps, 'children'> & { account: Account; popoverOnClose?: PopoverProps['onClose'] };

export default function DeleteDialog({ onClose, account, ...remainder }: ExportMnemonicDialogProps) {
  const { extensionStorage } = useExtensionStorage();

  const { removeAccount } = useCurrentAccount();

  const { enqueueSnackbar } = useSnackbar();

  const { accountName, encryptedPassword } = extensionStorage;

  const setDisposableLoading = useSetRecoilState(disposableLoadingState);

  const invalidNames = [...Object.values(accountName)];
  invalidNames.splice(invalidNames.indexOf(accountName[account.id], 1));

  const { passwordForm } = useSchema({ encryptedPassword: encryptedPassword! });

  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PasswordForm>({
    resolver: joiResolver(passwordForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const handleOnClose = () => {
    onClose?.({}, 'backdropClick');
    setTimeout(() => {
      reset();
    }, 200);
  };

  const submit = async () => {
    setDisposableLoading(false);

    await removeAccount(account);

    handleOnClose();

    enqueueSnackbar(t('pages.Account.Management.components.ManagePopover.DeleteDialog.index.deleteSnackbar'), { variant: 'error' });
  };

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      <DialogHeader onClose={handleOnClose}>{t('pages.Account.Management.components.ManagePopover.DeleteDialog.index.title')}</DialogHeader>

      <Container>
        <DescriptionContainer>
          <DescriptionImageContainer>
            <Info16Icon />
          </DescriptionImageContainer>
          <DescriptionTextContainer>
            <Typography variant="h6">{t('pages.Account.Management.components.ManagePopover.DeleteDialog.index.warning')}</Typography>
          </DescriptionTextContainer>
        </DescriptionContainer>
        <form onSubmit={handleSubmit(submit)}>
          <StyledInput
            inputProps={register('password', {
              setValueAs: (v: string) => (v ? sha512(v) : ''),
            })}
            type="password"
            placeholder={t('pages.Account.Management.components.ManagePopover.DeleteDialog.index.placeholder')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <StyledButton type="submit" disabled={!isDirty}>
            {t('pages.Account.Management.components.ManagePopover.DeleteDialog.index.confirm')}
          </StyledButton>
        </form>
      </Container>
    </Dialog>
  );
}
