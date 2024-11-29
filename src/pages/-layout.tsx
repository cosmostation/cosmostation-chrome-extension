import BaseLayout from '@/components/BaseLayout';
import HandleExtensionViewButton from '@/components/HandleExtensionViewButton';
import Header from '@/components/Header';
import GeneralSettingButton from '@/components/Header/components/GeneralSettingButton';
import NavigationPanel from '@/components/Header/components/NavigationPanel';

import { HeaderRightContainer } from './-styled';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  //   const { t } = useTranslation();

  return (
    <BaseLayout
      header={
        <Header
          leftContent={<NavigationPanel />}
          rightContent={
            <HeaderRightContainer>
              <GeneralSettingButton />
              <HandleExtensionViewButton />
            </HeaderRightContainer>
          }
        />
      }
    >
      {children}
    </BaseLayout>
  );
}
