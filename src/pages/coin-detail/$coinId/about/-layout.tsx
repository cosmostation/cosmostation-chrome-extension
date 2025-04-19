import { useTranslation } from 'react-i18next';

import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

type LayoutProps = {
  coinId: string;
  children: JSX.Element;
};

export default function Layout({ coinId, children }: LayoutProps) {
  const { t } = useTranslation();
  const { getAccountAsset } = useGetAccountAsset({ coinId });

  const accountAsset = getAccountAsset();

  return (
    <>
      <BaseLayout
        header={
          <Header
            leftContent={<NavigationPanel />}
            middleContent={
              <Base1300Text variant="h4_B">
                {t('pages.coin-detail.$coinId.about.layout.about', {
                  symbol: accountAsset?.asset.symbol,
                })}
              </Base1300Text>
            }
          />
        }
      >
        {children}
      </BaseLayout>
    </>
  );
}
