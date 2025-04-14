import BaseLayout from '@/components/BaseLayout';
import ConnectedDapp from '@/components/ConnectedDapp';
import HandleExtensionViewButton from '@/components/HandleExtensionViewButton';
import Header from '@/components/Header';
import AccountButton from '@/components/Header/components/AccountButton';
import GeneralSettingButton from '@/components/Header/components/GeneralSettingButton';
import NavigationPanel from '@/components/Header/components/NavigationPanel';

import { HeaderRightContainer } from './-styled';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <BaseLayout
      header={
        <Header
          leftContent={<NavigationPanel />}
          middleContent={<AccountButton />}
          rightContent={
            <HeaderRightContainer>
              <HandleExtensionViewButton />
              <GeneralSettingButton />
            </HeaderRightContainer>
          }
        />
      }
      footer={<ConnectedDapp />}
    >
      {children}
    </BaseLayout>
  );
}
