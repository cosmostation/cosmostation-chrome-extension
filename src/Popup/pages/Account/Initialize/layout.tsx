import { useNavigate } from '~/Popup/hooks/useNavigate';

import BaseLayout from './components/BaseLayout';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { navigateBack } = useNavigate();

  return <BaseLayout>{children}</BaseLayout>;
}
