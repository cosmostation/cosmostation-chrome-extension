import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import type { DialogProps, PopoverProps } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getKeyPair } from '~/Popup/utils/common';
import { sha512 } from '~/Popup/utils/crypto';
import type { Account } from '~/types/chromeStorage';

import PrivateKeyView from './PrivateKeyView';
import { Container, StyledButton, StyledInput } from './styled';
import type { PasswordForm } from './useSchema';
import { useSchema } from './useSchema';

type ExportPrivateKeyDialogProps = Omit<DialogProps, 'children'> & { account: Account; popoverOnClose?: PopoverProps['onClose'] };

export default function ExportPrivateKeyDialog({ onClose, account, ...remainder }: ExportPrivateKeyDialogProps) {
  const { chromeStorage } = useChromeStorage();

  const { currentChain } = useCurrentChain();

  const { accountName, encryptedPassword } = chromeStorage;

  const [password, setPassword] = useState('');

  const [privateKey, setPrivateKey] = useState('');

  const invalidNames = [...Object.values(accountName)];
  invalidNames.splice(invalidNames.indexOf(accountName[account.id], 1));

  const { t } = useTranslation();

  const { passwordForm } = useSchema({ encryptedPassword: encryptedPassword! });

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

  const submit = () => {
    const keyPair = getKeyPair(account, currentChain, password);

    setPrivateKey(keyPair?.privateKey.toString('hex') ?? '');
  };

  const handleOnClose = () => {
    onClose?.({}, 'backdropClick');
    setTimeout(() => {
      reset();
      setPassword('');
      setPrivateKey('');
    }, 200);
  };

  return (
    <Dialog {...remainder} onClose={handleOnClose}>
      {privateKey ? (
        <PrivateKeyView privateKey={privateKey} onClose={handleOnClose} />
      ) : (
        <>
          <DialogHeader onClose={handleOnClose}>{t('pages.Account.Management.components.ManagePopover.ExportPrivateKeyDialog.index.title')}</DialogHeader>
          <Container>
            <form onSubmit={handleSubmit(submit)}>
              <StyledInput
                inputProps={register('password', {
                  setValueAs: (v: string) => {
                    setPassword(v);
                    return v ? sha512(v) : '';
                  },
                })}
                type="password"
                placeholder={t('pages.Account.Management.components.ManagePopover.ExportPrivateKeyDialog.index.placeholder')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <StyledButton type="submit" disabled={!isDirty}>
                {t('pages.Account.Management.components.ManagePopover.ExportPrivateKeyDialog.index.confirm')}
              </StyledButton>
            </form>
          </Container>
        </>
      )}
    </Dialog>
  );
}
