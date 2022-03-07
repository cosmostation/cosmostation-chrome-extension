import { useNavigate } from '~/Popup/hooks/useNavigate';
import BaseLayout from '~/Popup/pages/Account/Initialize/components/BaseLayout';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { navigateBack } = useNavigate();

  return (
    <BaseLayout
      useHeader={{ onClick: () => navigateBack(), step: { total: 3, current: 2 } }}
      useTitle={{ title: 'Select a chain', description: 'Select chains to use with cosmostation wallet.' }}
    >
      {children}
    </BaseLayout>
  );
}
