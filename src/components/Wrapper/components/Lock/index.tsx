import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';
import { useLocation, useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { Route as ResetWallet } from '@/pages/manage-account/reset-wallet';
import { sha512 } from '@/utils/crypto/password';
import { removeTrailingSlash } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { FormContainer, RecoverPasswordTextButton, StyledInput, StyledInputContainer } from './styled';
import type { PasswordForm } from './useSchema';
import { useSchema } from './useSchema';

type LockProps = {
  children: JSX.Element;
};

export default function Lock({ children }: LockProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

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

  const isDisableLock = useMemo(() => {
    if (location.pathname === removeTrailingSlash(ResetWallet.to)) {
      return true;
    }
  }, [location.pathname]);

  // FIXME 계정을 다 지운 상태로 완전 새로고침을 했을 때 Lock페이지로 안가고 이니셜 페이지로 가서 비밀번호를 입력하는과정이 패싱됨.
  if (isDisableLock) {
    return children;
  }

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
          <RecoverPasswordTextButton
            typoVarient="b2_M"
            variant="underline"
            onClick={() => {
              navigate({
                to: ResetWallet.to,
              });
            }}
          >
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
