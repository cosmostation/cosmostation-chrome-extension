import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import BaseLayout from '~/Popup/pages/Account/Initialize/components/BaseLayout';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { navigateBack } = useNavigate();

  const { t } = useTranslation();

  return (
    <BaseLayout useHeader={{ onClick: () => navigateBack() }} useTitle={{ title: t('pages.Account.Initialize.Import.PrivateKey.layout.title') }}>
      {children}
    </BaseLayout>
  );
}
