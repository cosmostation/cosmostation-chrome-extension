import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { ButtonContainer, Container, PasswordContainer } from './styled';
import type { PasswordForm } from './useSchema';
import { useSchema } from './useSchema';

type PasswordProps = {
  onSubmit?: (data: PasswordForm) => void;
};

export default function Password({ onSubmit }: PasswordProps) {
  const { passwordForm } = useSchema();

  const { t } = useTranslation();

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
          <Input
            type="password"
            inputProps={register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            placeholder={t('pages.Account.Initialize.components.Password.index.newPlaceholder')}
          />
        </div>
        <PasswordContainer>
          <Input
            type="password"
            inputProps={register('repeatPassword')}
            error={!!errors.repeatPassword}
            helperText={errors.repeatPassword?.message}
            placeholder={t('pages.Account.Initialize.components.Password.index.confirmPlaceholder')}
          />
        </PasswordContainer>
        <ButtonContainer>
          <Button type="submit" disabled={!isDirty}>
            {t('pages.Account.Initialize.components.Password.index.next')}
          </Button>
        </ButtonContainer>
      </Container>
    </form>
  );
}
