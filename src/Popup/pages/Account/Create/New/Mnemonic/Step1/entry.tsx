import { useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { joiResolver } from '@hookform/resolvers/joi';

import Button from '~/Popup/components/common/Button';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { newMnemonicAccountState } from '~/Popup/recoils/newAccount';

import { BottomContainer, Container, StyledInput } from './styled';
import type { Step1Form } from './useSchema';
import { useSchema } from './useSchema';
import Description from '../components/Description';

export default function Entry() {
  const { navigate } = useNavigate();

  const { step1Form } = useSchema();

  const [newAccount, setNewAccount] = useRecoilState(newMnemonicAccountState);

  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<Step1Form>({
    resolver: joiResolver(step1Form),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
    defaultValues: { name: newAccount.accountName },
  });

  const submit = (data: Step1Form) => {
    setNewAccount((prev) => ({ ...prev, accountName: data.name }));
    reset();
    navigate('/account/create/new/mnemonic/step2');
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Container>
        <Description>{t('pages.Account.Create.New.Mnemonic.Step1.entry.description')}</Description>
        <StyledInput
          placeholder={t('pages.Account.Create.New.Mnemonic.Step1.entry.placeholder')}
          inputProps={register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <BottomContainer>
          <Button type="submit" disabled={!isDirty && !newAccount.accountName}>
            {t('pages.Account.Create.New.Mnemonic.Step1.entry.next')}
          </Button>
        </BottomContainer>
      </Container>
    </form>
  );
}
