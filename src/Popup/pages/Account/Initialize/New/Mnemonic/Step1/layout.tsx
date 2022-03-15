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
      useHeader={{ onClick: () => navigateBack(), step: { total: 5, current: 1 } }}
      useTitle={{
        title: t('pages.Account.Initialize.New.Mnemonic.Step1.layout.title'),
        description: t('pages.Account.Initialize.New.Mnemonic.Step1.layout.description'),
      }}
    >
      {children}
    </BaseLayout>
  );
}
