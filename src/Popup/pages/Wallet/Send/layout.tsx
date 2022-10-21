import BaseLayout from '~/Popup/components/BaseLayout';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  return <BaseLayout useHeader={{}}>{children}</BaseLayout>;
}
