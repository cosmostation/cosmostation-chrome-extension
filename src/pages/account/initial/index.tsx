import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import BaseLayout from '@/components/BaseLayout';
import Button from '@/components/common/Button';
import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';
import TextButton from '@/components/common/TextButton';
import Header from '@/components/Header';

import { TermsContainer } from './-styled';

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
            <CheckBoxTextButton
              onClick={() => {
                setIsCheckTerms(!isCheckTerms);
              }}
            >
              <Typography variant="b3_R">{t('pages.index.hideSmallBalance')}</Typography>
            </CheckBoxTextButton>
            <TextButton variant="hyperlink">{t('account.initial.button')}</TextButton>
          </TermsContainer>
          <Button
            type="button"
            disabled={!isCheckTerms}
            onClick={() => {
              navigate({ to: '/account/set-password' });
            }}
          >
            {t('account.initial.button')}
          </Button>
        </>
      }
    >
      <>sdfsdfsdf</>
    </BaseLayout>
  );
}
