import { Suspense, useCallback, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Header from '~/Popup/components/SelectSubHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useCurrentTabIndex } from '~/Popup/hooks/useCurrent/useCurrentTabIndex';
import { gte } from '~/Popup/utils/big';
import type { AptosChain } from '~/types/chain';

import CoinList from '../components/aptos/CoinList';
import NativeChainCard, { NativeChainCardError, NativeChainCardSkeleton } from '../components/aptos/NativeChainCard';
import LedgerCheck from '../components/LedgerCheck';
import { BottomContainer, Container, HeaderContainer, NativeChainCardContainer, StyledTabPanel } from '../styled';

type AptosProps = {
  chain: AptosChain;
};

export default function Aptos({ chain }: AptosProps) {
  const { currentTabIndex, setCurrentTabIndex } = useCurrentTabIndex();

  const { currentAccount } = useCurrentAccount();
  const { currentAptosNetwork, additionalAptosNetworks } = useCurrentAptosNetwork();

  const tabLabels = ['Coins', 'Activity'];

  const currentHomeTabIndex = useMemo(() => (gte(currentTabIndex, tabLabels.length) ? 0 : currentTabIndex), [currentTabIndex, tabLabels.length]);

  const [tabValue, setTabValue] = useState(currentHomeTabIndex);

  const handleChange = useCallback(
    (_: React.SyntheticEvent, newTabValue: number) => {
      setTabValue(newTabValue);

      setCurrentTabIndex(newTabValue);
    },
    [setCurrentTabIndex],
  );

  const isCustom = useMemo(
    () => !!additionalAptosNetworks.find((item) => item.id === currentAptosNetwork.id),
    [additionalAptosNetworks, currentAptosNetwork.id],
  );

  return (
    <Container key={`${currentAccount.id}-${currentAptosNetwork.id}`}>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <LedgerCheck>
        <>
          <NativeChainCardContainer>
            <ErrorBoundary
              // eslint-disable-next-line react/no-unstable-nested-components
              FallbackComponent={(props) => <NativeChainCardError chain={chain} isCustom={isCustom} {...props} />}
            >
              <Suspense fallback={<NativeChainCardSkeleton chain={chain} isCustom={isCustom} />}>
                <NativeChainCard chain={chain} isCustom={isCustom} />
              </Suspense>
            </ErrorBoundary>
          </NativeChainCardContainer>
          <Tabs value={tabValue} onChange={handleChange} variant="fullWidth">
            {tabLabels.map((item) => (
              <Tab key={item} label={item} />
            ))}
          </Tabs>
          <StyledTabPanel value={tabValue} index={0}>
            <BottomContainer>
              <CoinList />
            </BottomContainer>
          </StyledTabPanel>
        </>
      </LedgerCheck>
    </Container>
  );
}
