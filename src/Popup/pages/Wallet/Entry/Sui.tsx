import { Suspense, useCallback, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Header from '~/Popup/components/SelectSubHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useCurrentTabIndex } from '~/Popup/hooks/useCurrent/useCurrentTabIndex';
import { gte } from '~/Popup/utils/big';
import type { SuiChain } from '~/types/chain';

import LedgerCheck from '../components/LedgerCheck';
import CoinList from '../components/sui/CoinList';
import NativeChainCard, { NativeChainCardError, NativeChainCardSkeleton } from '../components/sui/NativeChainCard';
import NFTList from '../components/sui/NFTList';
import { BottomContainer, Container, HeaderContainer, NativeChainCardContainer, StyledTabPanel } from '../styled';

type SuiProps = {
  chain: SuiChain;
};

export default function Sui({ chain }: SuiProps) {
  const { currentTabIndex, setCurrentTabIndex } = useCurrentTabIndex();

  const { currentAccount } = useCurrentAccount();
  const { currentSuiNetwork, additionalSuiNetworks } = useCurrentSuiNetwork();

  const tabLabels = ['Coins', 'NFTs'];

  const currentHomeTabIndex = useMemo(() => (gte(currentTabIndex, tabLabels.length) ? 0 : currentTabIndex), [currentTabIndex, tabLabels.length]);

  const [tabValue, setTabValue] = useState(currentHomeTabIndex);

  const handleChange = useCallback(
    (_: React.SyntheticEvent, newTabValue: number) => {
      setTabValue(newTabValue);

      setCurrentTabIndex(newTabValue);
    },
    [setCurrentTabIndex],
  );

  const isCustom = useMemo(() => !!additionalSuiNetworks.find((item) => item.id === currentSuiNetwork.id), [additionalSuiNetworks, currentSuiNetwork.id]);

  return (
    <Container key={`${currentAccount.id}-${currentSuiNetwork.id}`}>
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
            <BottomContainer sx={{ marginTop: '0.9rem' }}>
              <ErrorBoundary fallback={<Empty />}>
                <Suspense fallback={null}>
                  <CoinList chain={chain} />
                </Suspense>
              </ErrorBoundary>
            </BottomContainer>
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <BottomContainer sx={{ marginTop: '0.9rem' }}>
              <ErrorBoundary fallback={<Empty />}>
                <Suspense fallback={null}>
                  <NFTList chain={chain} />
                </Suspense>
              </ErrorBoundary>
            </BottomContainer>
          </StyledTabPanel>
        </>
      </LedgerCheck>
    </Container>
  );
}
