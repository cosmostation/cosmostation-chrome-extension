import { useTranslation } from 'react-i18next';

import BaseLayout from '~/Popup/components/BaseLayout';
import { useNavigate } from '~/Popup/hooks/useNavigate';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { navigateBack } = useNavigate();

  const { t } = useTranslation();

  return (
    <BaseLayout useHeader={{}} useSubHeader={{ title: t('pages.Account.Create.Import.Mnemonic.layout.title'), onClick: () => navigateBack() }}>
      {children}
    </BaseLayout>
  );
}
