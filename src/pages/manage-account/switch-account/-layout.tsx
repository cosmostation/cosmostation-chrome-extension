import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { Route as ManageWalletAndAccount } from '@/pages/manage-account/manage-wallet-and-account';

import { ManageIconContainer, ManageText } from './-styled';

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
    >
      {children}
    </BaseLayout>
  );
}
