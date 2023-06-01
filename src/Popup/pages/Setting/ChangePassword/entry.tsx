import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { joiResolver } from '@hookform/resolvers/joi';

import Button from '~/Popup/components/common/Button';
import Divider from '~/Popup/components/common/Divider';
import Input from '~/Popup/components/common/Input';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { aesDecrypt, aesEncrypt, sha512 } from '~/Popup/utils/crypto';

import { ButtonContainer, Container, CurrentPasswordContainer, NewPasswordContainer } from './styled';
import type { ChangePasswordForm } from './useSchema';
import { useSchema } from './useSchema';

export default function Entry() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { changePasswordForm } = useSchema({ encryptedPassword: extensionStorage.encryptedPassword! });
  const { setCurrentPassword } = useCurrentPassword();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ChangePasswordForm>({
    resolver: joiResolver(changePasswordForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const submit = async (data: ChangePasswordForm) => {
    const { accounts } = extensionStorage;

    const newAccounts = accounts.map((account) => {
      if (account.type === 'MNEMONIC') {
        const mnemonic = aesDecrypt(account.encryptedMnemonic, password);

        return { ...account, encryptedMnemonic: aesEncrypt(mnemonic, data.newPassword), encryptedPassword: aesEncrypt(data.newPassword, mnemonic) };
      }

      if (account.type === 'PRIVATE_KEY') {
        const privateKey = aesDecrypt(account.encryptedPrivateKey, password);

        return { ...account, encryptedPrivateKey: aesEncrypt(privateKey, data.newPassword), encryptedPassword: aesEncrypt(data.newPassword, privateKey) };
      }

      return account;
    });

    await setExtensionStorage('accounts', newAccounts);

    await setExtensionStorage('encryptedPassword', sha512(data.newPassword));

    await setCurrentPassword(data.newPassword);

    reset();
    enqueueSnackbar(t('pages.Setting.ChangePassword.entry.changePasswordSnackbar'));
  };
  return (
    <form onSubmit={handleSubmit(submit)}>
      <Container>
        <CurrentPasswordContainer>
          <Input
            type="password"
            inputProps={register('password', {
              setValueAs: (v: string) => {
                setPassword(v);
                return v ? sha512(v) : '';
              },
            })}
            placeholder={t('pages.Setting.ChangePassword.entry.currentPasswordPlaceholder')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
        </CurrentPasswordContainer>
        <Divider />
        <NewPasswordContainer>
          <Input
            type="password"
            inputProps={register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            placeholder={t('pages.Setting.ChangePassword.entry.newPasswordPlaceholder')}
          />
        </NewPasswordContainer>
        <Input
          type="password"
          inputProps={register('repeatNewPassword')}
          error={!!errors.repeatNewPassword}
          helperText={errors.repeatNewPassword?.message}
          placeholder={t('pages.Setting.ChangePassword.entry.confirmNewPasswordPlaceholder')}
        />
        <ButtonContainer>
          <Button type="submit" disabled={!isDirty}>
            {t('pages.Setting.ChangePassword.entry.done')}
          </Button>
        </ButtonContainer>
      </Container>
    </form>
  );
}
