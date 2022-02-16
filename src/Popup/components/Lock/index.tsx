import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { FormHelperText, Typography } from '@mui/material';

import BaseLayout from '~/Popup/components/BaseLayout';
import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { sha512 } from '~/Popup/utils/crypto';

import { Container, ContentContainer, DescriptionContainer, PasswordContainer, RestoreContainer, TitleContainer, UnlockButtonContainer } from './styled';
import type { PasswordForm } from './useSchema';
import { useSchema } from './useSchema';

type LockProps = {
  children: JSX.Element;
};

export default function Lock({ children }: LockProps) {
  const { inMemory, setInMemory } = useInMemory();
  const { chromeStorage } = useChromeStorage();
  const { passwordForm } = useSchema({ encryptedPassword: chromeStorage.encryptedPassword! });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: joiResolver(passwordForm),
    mode: 'onSubmit',
    shouldFocusError: true,
  });

  const submit = async (data: PasswordForm) => {
    await setInMemory('password', data.password);
    reset();
  };

  if (inMemory.password === null && chromeStorage.encryptedPassword) {
    return (
      <BaseLayout useHeader={false}>
        <Container>
          <form onSubmit={handleSubmit(submit)}>
            <ContentContainer>
              <TitleContainer>
                <Typography variant="h1">COSMOSTATION</Typography>
              </TitleContainer>
              <DescriptionContainer>
                <Typography variant="h5">Wallet for Cosmos SDK Based Chains</Typography>
              </DescriptionContainer>
              <PasswordContainer>
                <Input
                  type="password"
                  placeholder="password"
                  inputProps={register('password', { setValueAs: (v: string) => (v ? sha512(v) : '') })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </PasswordContainer>
              <RestoreContainer>
                <Typography variant="h6">Do you need to restore account?</Typography>
              </RestoreContainer>
              <UnlockButtonContainer>
                <Button type="submit">Unlock</Button>
              </UnlockButtonContainer>
            </ContentContainer>
          </form>
        </Container>
      </BaseLayout>
    );
  }

  return children;
}
