import BaseLayout from '@/components/BaseLayout';
import Header from '@/components/Header';
import Navigator from '@/components/Header/components/Navigator';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  //   const { t } = useTranslation();

  return <BaseLayout header={<Header leftContent={<Navigator isHideHomeButton />} />}>{children}</BaseLayout>;
}
