import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

import BaseLayout from '@/components/BaseLayout';
import Header from '@/components/Header';
import Navigator from '@/components/Header/components/Navigator';

import { Body, DescriptionContainer, DescriptionSubTitle, DescriptionTitle } from './-styled';

export const Route = createFileRoute('/account/restore-wallet/mnemonic/')({
  component: RestoreWalletWithMnemonic,
});

function RestoreWalletWithMnemonic() {
  const { t } = useTranslation();

  return (
    <BaseLayout
      header={<Header leftContent={<Navigator isHideHomeButton />} />}
      footer={
        <>
          <Button type="button">{t('pages.account.set-password.index.next')}</Button>
        </>
      }
    >
      <Body>
        <DescriptionContainer>
          <DescriptionTitle variant="h2_B">{t('pages.account.set-password.index.title')}</DescriptionTitle>
          <DescriptionSubTitle variant="b3_R">{t('pages.account.set-password.index.subTitle')}</DescriptionSubTitle>
        </DescriptionContainer>
      </Body>
    </BaseLayout>
  );
}
