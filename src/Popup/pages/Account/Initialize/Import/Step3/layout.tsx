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
      useHeader={{ onClick: () => navigateBack(), step: { total: 3, current: 3 } }}
      useTitle={{ title: t('pages.Account.Initialize.Import.Step3.layout.title'), description: t('pages.Account.Initialize.Import.Step3.layout.description') }}
    >
      {children}
    </BaseLayout>
  );
}
