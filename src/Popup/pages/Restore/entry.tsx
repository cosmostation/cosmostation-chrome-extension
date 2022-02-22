import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { joiResolver } from '@hookform/resolvers/joi';

import Button from '~/Popup/components/common/Button';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { aesDecrypt, aesEncrypt, sha512 } from '~/Popup/utils/crypto';

import { ButtonContainer, Container, InputContainer, StyledInput48, StyledInput140 } from './styled';
import type { RestoreForm } from './useSchema';
import { useSchema } from './useSchema';

export default function Entry() {
  const [restoreString, setRestoreString] = useState('');
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { setInMemory } = useInMemory();
  const { enqueueSnackbar } = useSnackbar();

  const { restoreForm } = useSchema({ encryptedRestoreString: chromeStorage.accounts.map((account) => account.encryptedRestoreString) });
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<RestoreForm>({
    resolver: joiResolver(restoreForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const submit = async (data: RestoreForm) => {
    const { accounts } = chromeStorage;

    const restoreAccount = accounts.find((account) => account.encryptedRestoreString === data.restoreString)!;

    const lostPassword = aesDecrypt(restoreAccount.encryptedPassword, restoreString);

    const newAccounts = accounts.map((account) => {
      if (account.type === 'MNEMONIC') {
        const mnemonic = aesDecrypt(account.encryptedMnemonic, lostPassword);

        return {
          ...account,
          encryptedMnemonic: aesEncrypt(mnemonic, data.password),
          encryptedPassword: aesEncrypt(data.password, mnemonic),
        };
      }

      if (account.type === 'PRIVATE_KEY') {
        const privateKey = aesDecrypt(account.encryptedPrivateKey, lostPassword);

        return {
          ...account,
          encryptedMnemonic: aesEncrypt(privateKey, data.password),
          encryptedPassword: aesEncrypt(data.password, privateKey),
        };
      }

      return account;
    });

    await setChromeStorage('accounts', newAccounts);
    await setChromeStorage('encryptedPassword', sha512(data.password));
    await setInMemory('password', null);

    reset();

    enqueueSnackbar('Change password success', { variant: 'success' });
  };
  return (
    <Container>
      <form onSubmit={handleSubmit(submit)}>
        <InputContainer>
          <StyledInput140
            multiline
            minRows={6}
            placeholder={'To restore your password,\nplease enter your Cosmostation Wallet\nrecovery code (or phrase).'}
            type="password"
            inputProps={register('restoreString', {
              setValueAs: (v: string) => {
                setRestoreString(v.trim());
                return v ? sha512(v.trim()) : '';
              },
            })}
            error={!!errors.restoreString}
            helperText={errors.restoreString?.message}
          />
          <StyledInput48
            type="password"
            placeholder="new password"
            inputProps={register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <StyledInput48
            type="password"
            placeholder="new password confirmation"
            inputProps={register('repeatPassword')}
            error={!!errors.repeatPassword}
            helperText={errors.repeatPassword?.message}
          />
        </InputContainer>
        <ButtonContainer>
          <Button type="submit" disabled={!isDirty}>
            Restore
          </Button>
        </ButtonContainer>
      </form>
    </Container>
  );
}
