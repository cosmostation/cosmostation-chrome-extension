import BaseLayout from '~/Popup/components/BaseLayout';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { navigate } = useNavigate();

  const { t } = useTranslation();

  return (
    <BaseLayout useHeader={{}} useSubHeader={{ title: t('pages.Popup.TxReceipt.layout.title'), onClick: () => navigate('/') }}>
      {children}
    </BaseLayout>
  );
}
