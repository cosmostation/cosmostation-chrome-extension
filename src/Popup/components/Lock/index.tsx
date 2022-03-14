import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import BaseLayout from '~/Popup/components/BaseLayout';
import Button from '~/Popup/components/common/Button';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { sha512 } from '~/Popup/utils/crypto';

import {
  ButtonContainer,
  Container,
  ContentContainer,
  DescriptionContainer,
  PasswordContainer,
  RestoreButton,
  RestoreContainer,
  StyledInput,
  TitleContainer,
} from './styled';
import type { PasswordForm } from './useSchema';
import { useSchema } from './useSchema';

import Cosmostation21Icon from '~/images/icons/Cosmostation21.svg';
import Logo40Icon from '~/images/icons/Logo40.svg';

type LockProps = {
  children: JSX.Element;
};

export default function Lock({ children }: LockProps) {
  const { currentPassword, setCurrentPassword } = useCurrentPassword();
  const { chromeStorage } = useChromeStorage();
  const { navigate } = useNavigate();
  const { passwordForm } = useSchema({ encryptedPassword: chromeStorage.encryptedPassword! });

  const [password, setPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: joiResolver(passwordForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const submit = async () => {
    await setCurrentPassword(password);
    reset();
  };

  useEffect(() => {
    if (chromeStorage.accounts.length < 1) {
      navigate('/');
    }
  }, [chromeStorage.accounts, navigate]);

  if (chromeStorage.accounts.length < 1) {
    return null;
  }

  if (currentPassword === null && chromeStorage.encryptedPassword) {
    return (
      <BaseLayout>
        <Container>
          <form onSubmit={handleSubmit(submit)}>
            <ContentContainer>
              <TitleContainer>
                <Logo40Icon />
              </TitleContainer>
              <DescriptionContainer>
                <Cosmostation21Icon />
              </DescriptionContainer>
              <PasswordContainer>
                <StyledInput
                  type="password"
                  placeholder="password"
                  inputProps={register('password', {
                    setValueAs: (v: string) => {
                      setPassword(v);
                      return v ? sha512(v) : '';
                    },
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </PasswordContainer>

              <ButtonContainer>
                <RestoreContainer>
                  <Typography variant="h6">Do you need to&nbsp;</Typography>
                  <RestoreButton type="button" onClick={() => navigate('/restore')}>
                    <Typography variant="h6">
                      <u>restore account?</u>
                    </Typography>
                  </RestoreButton>
                </RestoreContainer>
                <Button type="submit">Unlock</Button>
              </ButtonContainer>
            </ContentContainer>
          </form>
        </Container>
      </BaseLayout>
    );
  }

  return children;
}
