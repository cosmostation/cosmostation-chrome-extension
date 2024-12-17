import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import StandardInput from '@/components/common/StandardInput';
import InformationPanel from '@/components/InformationPanel';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { Route as AddWallet } from '@/pages/account/add-wallet';

import { Body, CautionContainer, DescriptionContainer, DescriptionSubTitle, DescriptionTitle, FormContainer, PasswordInputContainer } from './-styled';
import type { PasswordForm } from './-useSchema';
import { useSchema } from './-useSchema';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { setCurrentPassword } = useCurrentPassword();

  const { passwordForm } = useSchema();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: joiResolver(passwordForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { password, repeatPassword } = watch();
  const isButtonEnabled = password && repeatPassword;

  const submit = (data: PasswordForm) => {
    setCurrentPassword(data.password);

    navigate({
      to: AddWallet.to,
    });
    reset();
  };

  return (
    <>
      <FormContainer onSubmit={handleSubmit(submit)}>
        <BaseBody>
          <Body>
            <DescriptionContainer>
              <DescriptionTitle variant="h2_B">{t('pages.account.set-password.index.title')}</DescriptionTitle>
              <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.account.set-password.index.subTitle')}</DescriptionSubTitle>
            </DescriptionContainer>
            <PasswordInputContainer>
              <StandardInput
                label={t('pages.account.set-password.index.password')}
                type="password"
                error={!!errors.password}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    ...register('password'),
                  },
                }}
              />
              <StandardInput
                label={t('pages.account.set-password.index.verifyPassword')}
                type="password"
                error={!!errors.repeatPassword}
                helperText={errors.repeatPassword?.message}
                slotProps={{
                  input: {
                    ...register('repeatPassword'),
                  },
                }}
              />
            </PasswordInputContainer>
          </Body>
        </BaseBody>
        <BaseFooter>
          <>
            <CautionContainer>
              <InformationPanel
                varitant="caution"
                title={<Typography variant="b3_M">{t('pages.account.set-password.index.caution')}</Typography>}
                body={<Typography variant="b4_R_Multiline">{t('pages.account.set-password.index.cautionDescription')}</Typography>}
              />
            </CautionContainer>
            <Button type="submit" disabled={!isButtonEnabled}>
              {t('pages.account.set-password.index.next')}
            </Button>
          </>
        </BaseFooter>
      </FormContainer>
    </>
  );
}
