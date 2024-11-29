import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import StandardInput from '@/components/common/StandardInput';
import InformationPanel from '@/components/InformationPanel';
import { Route as AddWallet } from '@/pages/account/add-wallet';

import { Body, CautionContainer, DescriptionContainer, DescriptionSubTitle, DescriptionTitle, PasswordInputContainer } from './-styled';

// TODO 훅폼, 조이 라이브러리 설정 필요.
export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [inputPassword, setinputPassword] = useState('');
  const [inputVerifyPassword, setinputVerifyPassword] = useState('');

  const passwordErrorMsg = (() => {
    if (inputPassword.length < 8) {
      return t('pages.account.set-password.index.passwordLength');
    }
  })();

  const verifyPasswordErrorMsg = (() => {
    if (inputPassword !== inputVerifyPassword) {
      return t('pages.account.set-password.index.passwordNotMatch');
    }
  })();

  const handleOnSubmit = () => {
    if (passwordErrorMsg || verifyPasswordErrorMsg) {
      return;
    }
    navigate({
      to: AddWallet.to,
    });
  };

  return (
    <>
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
              onChange={(e) => setinputPassword(e.currentTarget.value)}
              value={inputPassword}
              error={!!passwordErrorMsg}
              helperText={passwordErrorMsg}
            />
            <StandardInput
              label={t('pages.account.set-password.index.verifyPassword')}
              type="password"
              onChange={(e) => setinputVerifyPassword(e.currentTarget.value)}
              value={inputVerifyPassword}
              error={!!verifyPasswordErrorMsg}
              helperText={verifyPasswordErrorMsg}
            />
          </PasswordInputContainer>
        </Body>
      </BaseBody>
      <BaseFooter>
        <>
          <CautionContainer>
            <InformationPanel
              varitant="caution"
              titleText={t('pages.account.set-password.index.caution')}
              bodyText={t('pages.account.set-password.index.cautionDescription')}
            />
          </CautionContainer>
          <Button type="button" disabled={!!passwordErrorMsg || !!verifyPasswordErrorMsg} onClick={handleOnSubmit}>
            {t('pages.account.set-password.index.next')}
          </Button>
        </>
      </BaseFooter>
    </>
  );
}
