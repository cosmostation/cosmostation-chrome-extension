import { useTranslation } from 'react-i18next';
import { createFileRoute } from '@tanstack/react-router';

import BaseLayout from '@/components/BaseLayout';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import TextButton from '@/components/common/TextButton';
import Header from '@/components/Header';
import Navigator from '@/components/Header/components/Navigator';
import InformationPanel from '@/components/InformationPanel';

import OptionButton from './-components/OptionButton';
import { Body, DescriptionText, FooterContainer, OptionButtonsContainer } from './-styled';

export const Route = createFileRoute('/account/add-wallet/')({
  component: CreateAccount,
});

function CreateAccount() {
  const { t } = useTranslation();

  return (
    <BaseLayout
      header={<Header leftContent={<Navigator isHideHomeButton />} />}
      footer={
        <FooterContainer>
          <DescriptionText variant="b3_R">{t('pages.account.add-wallet.index.guide')}</DescriptionText>
          <TextButton variant="hyperlink">{t('pages.account.add-wallet.index.goToGuide')}</TextButton>
        </FooterContainer>
      }
    >
      <Body>
        <InformationPanel varitant="info" titleText={t('pages.account.add-wallet.index.infoTitle')} bodyText={t('pages.account.add-wallet.index.infoBody')} />

        <EdgeAligner>
          <OptionButtonsContainer>
            <OptionButton
              titleText={t('pages.account.add-wallet.index.createNewWallet')}
              bodyText={t('pages.account.add-wallet.index.createNewWalletDescription')}
            />
            <OptionButton
              titleText={t('pages.account.add-wallet.index.restoreWithMnemonic')}
              bodyText={t('pages.account.add-wallet.index.restoreWithMnemonicDescription')}
            />
            <OptionButton
              titleText={t('pages.account.add-wallet.index.restoreWithPrivateKey')}
              bodyText={t('pages.account.add-wallet.index.restoreWithPrivateKeyDescription')}
            />
          </OptionButtonsContainer>
        </EdgeAligner>
      </Body>
    </BaseLayout>
  );
}
