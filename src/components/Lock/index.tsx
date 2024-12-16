import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { sha512 } from '@/utils/crypto/password';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { FormContainer, RecoverPasswordTextButton, StyledInput, StyledInputContainer } from './styled';
import type { PasswordForm } from './useSchema';
import { useSchema } from './useSchema';

type LockProps = {
  children: JSX.Element;
};

export default function Lock({ children }: LockProps) {
  const { t } = useTranslation();
  const { currentPassword, setCurrentPassword } = useCurrentPassword();
  const { comparisonPasswordHash } = useExtensionStorageStore((state) => state);

  const [inputPassword, setInputPassword] = useState('');

  const { passwordForm } = useSchema({ comparisonPasswordHash: comparisonPasswordHash! });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: joiResolver(passwordForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { ref, ...remainder } = register('password', {
    setValueAs: (v: string) => {
      setInputPassword(v);
      return v ? sha512(v) : '';
    },
  });

  const { password } = watch();
  const isButtonEnabled = !!password;

  const submit = async () => {
    await setCurrentPassword(inputPassword);
    reset();
  };

  // TODO
  //   useEffect(() => {
  //     if (extensionStorage.accounts.length < 1) {
  //       navigate('/');
  //     }
  //   }, [extensionStorage.accounts, navigate]);

  //   if (extensionStorage.accounts.length < 1) {
  //     return null;
  //   }

  if (!currentPassword && comparisonPasswordHash) {
    return (
      <FormContainer onSubmit={handleSubmit(submit)}>
        <BaseBody>
          <StyledInputContainer>
            <StyledInput
              placeholder={t('components.Lock.index.enterPassword')}
              type="password"
              error={!!errors.password}
              helperText={errors.password?.message}
              inputRef={ref}
              {...remainder}
            />
          </StyledInputContainer>
        </BaseBody>
        <BaseFooter>
          <RecoverPasswordTextButton typoVarient="b2_M" variant="underline">
            {t('components.Lock.index.forgotPassword')}
          </RecoverPasswordTextButton>
          <Button type="submit" disabled={!isButtonEnabled}>
            {t('components.Lock.index.unlock')}
          </Button>
        </BaseFooter>
      </FormContainer>
    );
  }
  return children;
}
