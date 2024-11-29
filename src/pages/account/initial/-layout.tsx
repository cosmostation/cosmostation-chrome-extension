import BaseLayout from '@/components/BaseLayout';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  //   const { t } = useTranslation();

  return <BaseLayout header={<Header leftContent={<NavigationPanel isHideBackButton isHideHomeButton />} />}>{children}</BaseLayout>;
}
