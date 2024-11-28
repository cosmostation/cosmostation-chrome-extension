import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import TextButton from '@/components/common/TextButton';
import InformationPanel from '@/components/InformationPanel';

import OptionButton from './-components/OptionButton';
import { Body, DescriptionText, FooterContainer, OptionButtonsContainer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();

  return (
    <>
      <BaseBody>
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
      </BaseBody>
      <BaseFooter>
        <FooterContainer>
          <DescriptionText variant="b3_R">{t('pages.account.add-wallet.index.guide')}</DescriptionText>
          <TextButton variant="hyperlink">{t('pages.account.add-wallet.index.goToGuide')}</TextButton>
        </FooterContainer>
      </BaseFooter>
    </>
  );
}
