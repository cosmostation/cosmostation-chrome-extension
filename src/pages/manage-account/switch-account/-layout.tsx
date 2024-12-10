import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import IconTextButton from '@/components/common/IconTextButton';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { Route as AddWallet } from '@/pages/account/add-wallet';
import { Route as ManageWalletAndAccount } from '@/pages/manage-account/manage-wallet-and-account';

import { FooterContainer, ManageIconContainer, ManageText } from './-styled';

import ManageIcon from '@/assets/images/icons/MangeWalletIcon16.svg';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <BaseLayout
      header={
        <Header
          leftContent={<NavigationPanel />}
          middleContent={<Base1300Text variant="h4_B">{t('pages.manage-account.switch-account.layout.header')}</Base1300Text>}
          rightContent={
            <IconTextButton
              leadingIcon={
                <ManageIconContainer>
                  <ManageIcon />
                </ManageIconContainer>
              }
              onClick={() => {
                navigate({
                  to: ManageWalletAndAccount.to,
                });
              }}
            >
              <ManageText variant="h6n_M">{t('pages.manage-account.switch-account.layout.manage')}</ManageText>
            </IconTextButton>
          }
        />
      }
      footer={
        <FooterContainer>
          <Button
            onClick={() => {
              navigate({ to: AddWallet.to });
            }}
          >
            {t('pages.manage-account.switch-account.layout.addWallet')}
          </Button>
        </FooterContainer>
      }
    >
      {children}
    </BaseLayout>
  );
}
