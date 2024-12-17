import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';
import { Typography } from '@mui/material';
import { useRouter } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button';
import StandardInput from '@/components/common/StandardInput';
import InformationPanel from '@/components/InformationPanel';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { aesDecrypt, aesEncrypt } from '@/utils/crypto';
import { sha512 } from '@/utils/crypto/password';
import { toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  Body,
  CautionContainer,
  DescriptionContainer,
  DescriptionSubTitle,
  DescriptionTitle,
  Divider,
  FormContainer,
  NewPasswordInputContainer,
  PrevioudPasswordInputContainer,
} from './-styled';
import type { ChangePasswordForm } from './-useSchema';
import { useSchema } from './-useSchema';

export default function Entry() {
  const { t } = useTranslation();
  const { history } = useRouter();

  const { accounts, comparisonPasswordHash, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { setCurrentPassword } = useCurrentPassword();
  const [inputPreviousPassword, setInputPreviousPassword] = useState('');

  const { newPasswordForm } = useSchema({ comparisonPasswordHash });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordForm>({
    resolver: joiResolver(newPasswordForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { previousPassword, newPassword, repeatNewPassword } = watch();
  const isButtonEnabled = previousPassword && newPassword && repeatNewPassword;

  const submit = async (data: ChangePasswordForm) => {
    const newAccounts = accounts.map((account) => {
      if (account.type === 'MNEMONIC') {
        const mnemonic = aesDecrypt(account.encryptedMnemonic, inputPreviousPassword);

        return { ...account, encryptedMnemonic: aesEncrypt(mnemonic, data.newPassword), encryptedPassword: aesEncrypt(data.newPassword, mnemonic) };
      }

      if (account.type === 'PRIVATE_KEY') {
        const privateKey = aesDecrypt(account.encryptedPrivateKey, inputPreviousPassword);

        return { ...account, encryptedPrivateKey: aesEncrypt(privateKey, data.newPassword), encryptedPassword: aesEncrypt(data.newPassword, privateKey) };
      }

      return account;
    });

    await updateExtensionStorageStore('accounts', newAccounts);

    await updateExtensionStorageStore('comparisonPasswordHash', sha512(data.newPassword));

    await setCurrentPassword(data.newPassword);

    reset();
    toastSuccess(t('pages.general-setting.change-password.entry.success'));

    history.go(-1);
  };

  return (
    <FormContainer onSubmit={handleSubmit(submit)}>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.general-setting.change-password.entry.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.general-setting.change-password.entry.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>

          <PrevioudPasswordInputContainer>
            <StandardInput
              label={t('pages.general-setting.change-password.entry.currentPassword')}
              type="password"
              error={!!errors.previousPassword}
              helperText={errors.previousPassword?.message}
              slotProps={{
                input: {
                  ...register('previousPassword', {
                    setValueAs: (v: string) => {
                      setInputPreviousPassword(v);
                      return v ? sha512(v) : '';
                    },
                  }),
                },
              }}
            />
          </PrevioudPasswordInputContainer>
          <EdgeAligner>
            <Divider />
          </EdgeAligner>
          <NewPasswordInputContainer>
            <StandardInput
              label={t('pages.general-setting.change-password.entry.newPassword')}
              type="password"
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              slotProps={{
                input: {
                  ...register('newPassword'),
                },
              }}
            />
            <StandardInput
              label={t('pages.general-setting.change-password.entry.confirmNewPassword')}
              type="password"
              error={!!errors.repeatNewPassword}
              helperText={errors.repeatNewPassword?.message}
              slotProps={{
                input: {
                  ...register('repeatNewPassword'),
                },
              }}
            />
          </NewPasswordInputContainer>
        </Body>
      </BaseBody>
      <BaseFooter>
        <>
          <CautionContainer>
            <InformationPanel
              varitant="caution"
              title={<Typography variant="b3_M">{t('pages.general-setting.change-password.entry.caution')}</Typography>}
              body={<Typography variant="b4_R_Multiline">{t('pages.general-setting.change-password.entry.cautionDescription')}</Typography>}
            />
          </CautionContainer>
          <Button type="submit" disabled={!isButtonEnabled}>
            {t('pages.general-setting.change-password.entry.submit')}
          </Button>
        </>
      </BaseFooter>
    </FormContainer>
  );
}
