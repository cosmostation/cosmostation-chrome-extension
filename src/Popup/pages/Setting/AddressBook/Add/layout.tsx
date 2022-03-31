import BaseLayout from '~/Popup/components/BaseLayout';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { navigateBack } = useNavigate();

  const { t } = useTranslation();

  return (
    <BaseLayout useHeader={{}} useSubHeader={{ title: t('pages.Setting.AddressBook.Add.layout.title'), onClick: () => navigateBack() }}>
      {children}
    </BaseLayout>
  );
}
