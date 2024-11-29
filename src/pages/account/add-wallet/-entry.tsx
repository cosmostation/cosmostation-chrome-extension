import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import TextButton from '@/components/common/TextButton';
import InformationPanel from '@/components/InformationPanel';
import { Route as CreateMnemonic } from '@/pages/account/create-wallet/mnemonic';
import { Route as RestoreWalletWithMnemonic } from '@/pages/account/restore-wallet/mnemonic';
import { Route as RestoreWalletWithPrivateKey } from '@/pages/account/restore-wallet/privatekey';

import OptionButton from './-components/OptionButton';
import { Body, DescriptionText, FooterContainer, OptionButtonsContainer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <BaseBody>
        <Body>
          <InformationPanel varitant="info" titleText={t('pages.account.add-wallet.index.infoTitle')} bodyText={t('pages.account.add-wallet.index.infoBody')} />

          <EdgeAligner>
            <OptionButtonsContainer>
              <OptionButton
                onClick={() =>
                  navigate({
                    to: CreateMnemonic.to,
                  })
                }
                titleText={t('pages.account.add-wallet.index.createNewWallet')}
                bodyText={t('pages.account.add-wallet.index.createNewWalletDescription')}
              />
              <OptionButton
                onClick={() =>
                  navigate({
                    to: RestoreWalletWithMnemonic.to,
                  })
                }
                titleText={t('pages.account.add-wallet.index.restoreWithMnemonic')}
                bodyText={t('pages.account.add-wallet.index.restoreWithMnemonicDescription')}
              />
              <OptionButton
                onClick={() =>
                  navigate({
                    to: RestoreWalletWithPrivateKey.to,
                  })
                }
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
