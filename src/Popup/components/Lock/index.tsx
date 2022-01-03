import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { sha512 } from '~/Popup/utils/crypto';

import { Button, Container, TextField } from './styled';
import type { PasswordForm } from './useSchema';
import { useSchema } from './useSchema';

type LockProps = {
  children: JSX.Element;
};

export default function Lock({ children }: LockProps) {
  const { inMemory, setInMemory } = useInMemory();
  const { chromeStorage } = useChromeStorage();
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
    const password = sha512(data.password);
    if (chromeStorage.encryptedPassword === password) {
      await setInMemory('password', data.password);
    }
  };

  if (inMemory.password === null && chromeStorage.encryptedPassword) {
    return (
      <div>
        <div>lock page</div>
        <div>
          <form onSubmit={handleSubmit(submit)}>
            <TextField
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button type="submit">button</Button>
          </form>
        </div>
      </div>
    );
  }

  return children;
}
