import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';

type LayoutProps = {
  siteTitle?: string;
  children: JSX.Element;
};

export default function Layout({ children, siteTitle = 'Connecting' }: LayoutProps) {
  return (
    <BaseLayout
      header={
        <Header leftContent={<NavigationPanel isHideBackButton isHideHomeButton />} middleContent={<Base1300Text variant="h4_B">{siteTitle}</Base1300Text>} />
      }
    >
      {children}
    </BaseLayout>
  );
}
