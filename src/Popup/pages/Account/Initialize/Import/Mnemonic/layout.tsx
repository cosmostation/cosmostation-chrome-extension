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
    <BaseLayout
      useHeader={{ onClick: () => navigateBack(), step: { current: 1, total: 3 } }}
      useTitle={{ title: t('pages.Account.Initialize.Import.Mnemonic.layout.title') }}
    >
      {children}
    </BaseLayout>
  );
}
