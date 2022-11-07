import BaseLayout from '~/Popup/components/BaseLayout';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { navigateBack } = useNavigate();

  const { t } = useTranslation();

  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'COSMOS') {
    return <BaseLayout useHeader={{}}>{children}</BaseLayout>;
  }

  return (
    <BaseLayout useHeader={{}} useSubHeader={{ title: t('pages.Wallet.Send.layout.title'), onClick: () => navigateBack() }}>
      {children}
    </BaseLayout>
  );
}
