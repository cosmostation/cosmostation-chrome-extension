import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { sha512 } from '~/Popup/utils/crypto';

import { Button, Container, TextField } from './styled';
import type { PasswordForm } from './useSchema';
import { useSchema } from './useSchema';

export default function Password() {
  const { changeLanguage, language } = useTranslation();
  const { inMemory, setInMemory } = useInMemory();
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { navigate } = useNavigate();
  const { passwordForm } = useSchema();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: joiResolver(passwordForm),
    mode: 'all',
    shouldFocusError: true,
  });

  const submit = async (data: PasswordForm) => {
    await setChromeStorage('encryptedPassword', sha512(data.password));
    await setInMemory('password', data.password);
    navigate('/register/account');
  };

  useEffect(() => {
    if (chromeStorage.encryptedPassword) {
      navigate('/', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log(errors);
  }, [errors]);
  return (
    <Container>
      <form onSubmit={handleSubmit(submit)}>
        <TextField
          type="password"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          type="password"
          {...register('repeatPassword')}
          error={!!errors.repeatPassword}
          helperText={errors.repeatPassword?.message}
        />
        <Button type="submit">button</Button>
      </form>
      <Button
        type="button"
        onClick={async () => {
          await changeLanguage(language === 'ko' ? 'en' : 'ko');
        }}
      >
        toggle
      </Button>

      <Button type="button" onClick={() => null}>
        cosmos
      </Button>
    </Container>
  );
}
// 1638342264108
