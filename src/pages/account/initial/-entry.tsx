import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import TextButton from '@/components/common/TextButton';
import { Route as SetPassword } from '@/pages/account/set-password';

import { Container, StyledCheckBoxTextButton, TermsContainer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isCheckTerms, setIsCheckTerms] = useState(false);

  return (
    <>
      <BaseBody>
        <Container>splash screen</Container>
      </BaseBody>
      <BaseFooter>
        <>
          <TermsContainer>
            <StyledCheckBoxTextButton
              onClick={() => {
                setIsCheckTerms(!isCheckTerms);
              }}
            >
              <Typography variant="b3_R">{t('pages.account.initial.index.termsNotice')}</Typography>
            </StyledCheckBoxTextButton>
            <TextButton variant="hyperlink">{t('pages.account.initial.index.termsOfUse')}</TextButton>
          </TermsContainer>
          <Button
            disabled={!isCheckTerms}
            onClick={() => {
              navigate({ to: SetPassword.to });
            }}
          >
            {t('pages.account.initial.index.start')}
          </Button>
        </>
      </BaseFooter>
    </>
  );
}
