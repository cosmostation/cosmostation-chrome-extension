import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import IconButton from '@/components/common/IconButton';
import FooterCoinPrice from '@/components/FooterCoinPrice';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { getCoinId } from '@/utils/queryParamGenerator';

import ExplorerIcon from '@/assets/images/icons/Explorer14.svg';

type LayoutProps = {
  children: JSX.Element;
  coinId: string;
};

export default function Layout({ children, coinId }: LayoutProps) {
  const { currentAccount } = useCurrentAccount();

  const { data } = useAccountAssets();
  const currentCoin = data?.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const explorerUrl = currentCoin?.chain.explorer?.account.replace('${address}', currentCoin.address.address);

  return (
    <BaseLayout
      header={
        <Header
          leftContent={<NavigationPanel />}
          middleContent={<Base1300Text variant="h4_B">{currentAccount.name}</Base1300Text>}
          rightContent={
            <IconButton onClick={() => window.open(explorerUrl, '_blank')}>
              <ExplorerIcon />
            </IconButton>
          }
        />
      }
      footer={<FooterCoinPrice coinId={coinId} />}
    >
      {children}
    </BaseLayout>
  );
}
