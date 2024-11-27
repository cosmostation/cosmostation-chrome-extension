import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import BaseLayout from '@/components/BaseLayout';
import Button from '@/components/common/Button';
import TextButton from '@/components/common/TextButton';
import Header from '@/components/Header';
import { Route as SetPassword } from '@/pages/account/set-password';

import { Body, StyledCheckBoxTextButton, TermsContainer } from './-styled';

export const Route = createFileRoute('/account/initial/')({
  component: Initial,
});

function Initial() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isCheckTerms, setIsCheckTerms] = useState(false);

  return (
    <BaseLayout
      header={<Header />}
      footer={
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
            type="button"
            disabled={!isCheckTerms}
            onClick={() => {
              navigate({ to: SetPassword.to });
            }}
          >
            {t('pages.account.initial.index.start')}
          </Button>
        </>
      }
    >
      <Body>sdfsdfsdf</Body>
    </BaseLayout>
  );
}
