import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import BaseLayout from '~/Popup/components/BaseLayout';
import Button from '~/Popup/components/common/Button';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { sha512 } from '~/Popup/utils/crypto';

import LostDialog from './LostDialog';
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
import Logo40Icon from '~/images/icons/Logo40-2.svg';

type LockProps = {
  children: JSX.Element;
};

export default function Lock({ children }: LockProps) {
  const { currentPassword, setCurrentPassword } = useCurrentPassword();
  const { extensionStorage } = useExtensionStorage();
  const { navigate } = useNavigate();
  const { passwordForm } = useSchema({ encryptedPassword: extensionStorage.encryptedPassword! });

  const [isOpenedLostDialog, setIsOpenedLostDialog] = useState(false);

  const [password, setPassword] = useState('');

  const { t } = useTranslation();

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
    if (extensionStorage.accounts.length < 1) {
      navigate('/');
    }
  }, [extensionStorage.accounts, navigate]);

  if (extensionStorage.accounts.length < 1) {
    return null;
  }

  if (currentPassword === null && extensionStorage.encryptedPassword) {
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
                  placeholder={t('components.Lock.index.passwordPlaceholder')}
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
                  <RestoreButton type="button" onClick={() => setIsOpenedLostDialog(true)}>
                    <Typography variant="h6">
                      <u>{t('components.Lock.index.lostButton')}</u>
                    </Typography>
                  </RestoreButton>
                </RestoreContainer>
                <Button type="submit">{t('components.Lock.index.unlockButton')}</Button>
              </ButtonContainer>
            </ContentContainer>
          </form>
          <LostDialog open={isOpenedLostDialog} onClose={() => setIsOpenedLostDialog(false)} />
        </Container>
      </BaseLayout>
    );
  }

  return children;
}
