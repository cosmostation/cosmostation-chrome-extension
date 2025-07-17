import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
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

import CreateWalletIcon from '@/assets/images/icons/CreateWallet28.svg';
import MnemonicWalletIcon from '@/assets/images/icons/MnemonicWallet28.svg';
import PrivateKeyWalletIcon from '@/assets/images/icons/PrivateKeyWallet28.svg';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <BaseBody>
        <Body>
          <InformationPanel
            varitant="info"
            title={<Typography variant="b3_M">{t('pages.account.add-wallet.index.infoTitle')}</Typography>}
            body={<Typography variant="b4_R_Multiline">{t('pages.account.add-wallet.index.infoBody')}</Typography>}
          />

          <EdgeAligner>
            <OptionButtonsContainer>
              <OptionButton
                onClick={() =>
                  navigate({
                    to: CreateMnemonic.to,
                  })
                }
                icon={<CreateWalletIcon />}
                titleText={t('pages.account.add-wallet.index.createNewWallet')}
                bodyText={t('pages.account.add-wallet.index.createNewWalletDescription')}
              />
              <OptionButton
                onClick={() =>
                  navigate({
                    to: RestoreWalletWithMnemonic.to,
                  })
                }
                icon={<MnemonicWalletIcon />}
                titleText={t('pages.account.add-wallet.index.restoreWithMnemonic')}
                bodyText={t('pages.account.add-wallet.index.restoreWithMnemonicDescription')}
              />
              <OptionButton
                onClick={() =>
                  navigate({
                    to: RestoreWalletWithPrivateKey.to,
                  })
                }
                icon={<PrivateKeyWalletIcon />}
                titleText={t('pages.account.add-wallet.index.restoreWithPrivateKey')}
                bodyText={t('pages.account.add-wallet.index.restoreWithPrivateKeyDescription')}
              />
            </OptionButtonsContainer>
          </EdgeAligner>
        </Body>
      </BaseBody>
      <BaseFooter>
        <FooterContainer
          style={{
            display: 'none',
          }}
        >
          <DescriptionText variant="b3_R">{t('pages.account.add-wallet.index.guide')}</DescriptionText>
          <TextButton variant="hyperlink">{t('pages.account.add-wallet.index.goToGuide')}</TextButton>
        </FooterContainer>
      </BaseFooter>
    </>
  );
}
