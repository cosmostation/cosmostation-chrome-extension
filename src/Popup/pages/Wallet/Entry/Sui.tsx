import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Header from '~/Popup/components/SelectSubHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
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
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { homeTabIndex } = extensionStorage;

  const { currentAccount } = useCurrentAccount();
  const { currentSuiNetwork, additionalSuiNetworks } = useCurrentSuiNetwork();

  const tabLabels = ['Coins', 'NFTs'];

  const [tabValue, setTabValue] = useState(!gte(homeTabIndex.sui, tabLabels.length) ? homeTabIndex.sui : 0);

  const handleChange = useCallback((_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  }, []);

  const isCustom = useMemo(() => !!additionalSuiNetworks.find((item) => item.id === currentSuiNetwork.id), [additionalSuiNetworks, currentSuiNetwork.id]);

  useEffect(() => {
    if (gte(homeTabIndex.sui, tabLabels.length)) {
      void setExtensionStorage('homeTabIndex', {
        ...homeTabIndex,
        sui: 0,
      });

      setTabValue(0);
    }

    void setExtensionStorage('homeTabIndex', {
      ...homeTabIndex,
      sui: tabValue,
    });
  }, [homeTabIndex, setExtensionStorage, tabLabels.length, tabValue]);

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
