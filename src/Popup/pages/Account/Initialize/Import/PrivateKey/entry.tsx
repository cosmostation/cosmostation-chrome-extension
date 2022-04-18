import { useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { joiResolver } from '@hookform/resolvers/joi';

import Button from '~/Popup/components/common/Button';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { newPrivateKeyAccountState } from '~/Popup/recoils/newAccount';

import { BottomContainer, Container, InputContainer, StyledInput48, StyledInput140 } from './styled';
import type { PrivateKeyForm } from './useSchema';
import { useSchema } from './useSchema';

export type CheckWord = {
  index: number;
  word: string;
};

export default function Entry() {
  const { navigate } = useNavigate();

  const [newAccount, setNewAccount] = useRecoilState(newPrivateKeyAccountState);

  const { privateKeyForm } = useSchema();

  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PrivateKeyForm>({
    resolver: joiResolver(privateKeyForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
    defaultValues: {
      name: newAccount.accountName,
      privateKey: newAccount.privateKey,
    },
  });

  const submit = (data: PrivateKeyForm) => {
    const privateKey = data.privateKey.startsWith('0x') ? data.privateKey.substring(2) : data.privateKey;

    setNewAccount((prev) => ({ ...prev, accountName: data.name, privateKey }));

    navigate('/account/initialize/import/step2');

    reset();
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Container>
        <InputContainer>
          <div>
            <StyledInput48
              placeholder={t('pages.Account.Initialize.Import.PrivateKey.entry.accountName')}
              inputProps={register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </div>
          <div>
            <StyledInput140
              multiline
              minRows={6}
              placeholder={t('pages.Account.Initialize.Import.PrivateKey.entry.privateKey')}
              inputProps={register('privateKey', { setValueAs: (v: string) => v.trim() })}
              error={!!errors.privateKey}
              helperText={errors.privateKey?.message}
            />
          </div>
        </InputContainer>
        <BottomContainer>
          <Button type="submit" disabled={!isDirty && !newAccount.accountName}>
            {t('pages.Account.Initialize.Import.PrivateKey.entry.next')}
          </Button>
        </BottomContainer>
      </Container>
    </form>
  );
}
