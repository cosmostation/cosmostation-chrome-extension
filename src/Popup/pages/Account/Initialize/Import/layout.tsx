import { useNavigate } from '~/Popup/hooks/useNavigate';
import BaseLayout from '~/Popup/pages/Account/Initialize/components/BaseLayout';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { navigateBack } = useNavigate();

  return (
    <BaseLayout useHeader={{ onClick: () => navigateBack() }} useTitle={{ title: 'Restore an account' }}>
      {children}
    </BaseLayout>
  );
}
