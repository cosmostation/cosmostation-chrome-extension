import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';

import { ButtonContainer, Container, PasswordContainer } from './styled';
import type { PasswordForm } from './useSchema';
import { useSchema } from './useSchema';

type PasswordProps = {
  onSubmit?: (data: PasswordForm) => void;
};

export default function Password({ onSubmit }: PasswordProps) {
  const { passwordForm } = useSchema();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PasswordForm>({
    resolver: joiResolver(passwordForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const submit = (data: PasswordForm) => {
    onSubmit?.(data);
    reset();
  };
  return (
    <form onSubmit={handleSubmit(submit)}>
      <Container>
        <div>
          <Input type="password" inputProps={register('password')} error={!!errors.password} helperText={errors.password?.message} placeholder="password" />
        </div>
        <PasswordContainer>
          <Input
            type="password"
            inputProps={register('repeatPassword')}
            error={!!errors.repeatPassword}
            helperText={errors.repeatPassword?.message}
            placeholder="password confirmation"
          />
        </PasswordContainer>
        <ButtonContainer>
          <Button type="submit" disabled={!isDirty}>
            Next
          </Button>
        </ButtonContainer>
      </Container>
    </form>
  );
}
