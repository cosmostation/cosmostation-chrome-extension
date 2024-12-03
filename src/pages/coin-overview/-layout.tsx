import BaseLayout from '@/components/BaseLayout';
import FooterCoinPrice from '@/components/FooterCoinPrice';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  //   const { t } = useTranslation();
  // NOTE useParams로 현재 선택된 그룹 토큰을 특정지어서 푸터에 가격 표시할 수 있도록 구현 필요.
  return (
    <BaseLayout
      header={
        <Header
          leftContent={<NavigationPanel />}
          // TODO 계정 선택 버튼
          // middleContent={}
        />
      }
      footer={
        <FooterCoinPrice
          coin={{
            coinGeckoId: 'bitcoin',
            id: 'bitcoin',
          }}
        />
      }
    >
      {children}
    </BaseLayout>
  );
}
