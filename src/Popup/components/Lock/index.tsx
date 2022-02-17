import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';

import BaseLayout from '~/Popup/components/BaseLayout';
import Button from '~/Popup/components/common/Button';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
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
                <Logo40Icon />
              </TitleContainer>
              <DescriptionContainer>
                <Cosmostation21Icon />
              </DescriptionContainer>
              <PasswordContainer>
                <StyledInput
                  type="password"
                  placeholder="password"
                  inputProps={register('password', { setValueAs: (v: string) => (v ? sha512(v) : '') })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </PasswordContainer>

              <ButtonContainer>
                <RestoreContainer>
                  <Typography variant="h6">Do you need to&nbsp;</Typography>
                  <RestoreButton>
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
