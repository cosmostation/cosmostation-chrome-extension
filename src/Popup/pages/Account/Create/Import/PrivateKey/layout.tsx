import BaseLayout from '~/Popup/components/BaseLayout';
import { useNavigate } from '~/Popup/hooks/useNavigate';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { navigateBack } = useNavigate();

  return (
    <BaseLayout useHeader={{}} useSubHeader={{ title: 'Import private key ', onClick: () => navigateBack() }}>
      {children}
    </BaseLayout>
  );
}
