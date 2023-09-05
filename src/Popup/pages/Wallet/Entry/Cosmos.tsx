import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Header from '~/Popup/components/SelectSubHeader';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentTabIndex } from '~/Popup/hooks/useCurrent/useCurrentTabIndex';
import type { CosmosChain } from '~/types/chain';

import ActivityList from '../components/cosmos/ActivityList';
import CoinList from '../components/cosmos/CoinList';
import NativeChainCard, { NativeChainCardError, NativeChainCardSkeleton } from '../components/cosmos/NativeChainCard';
import NFTList from '../components/cosmos/NFTList';
import TerminatedNativeChainCard from '../components/cosmos/TerminatedNativeChainCard';
import LedgerCheck from '../components/LedgerCheck';
import { BottomContainer, Container, HeaderContainer, NativeChainCardContainer, StyledTabPanel } from '../styled';

type CosmosProps = {
  chain: CosmosChain;
};

export default function Cosmos({ chain }: CosmosProps) {
  useCoinGeckoPriceSWR();

  const { currentTabIndex, setCurrentTabIndex } = useCurrentTabIndex();

  const { currentAccount } = useCurrentAccount();

  const tabLabels = useMemo(
    () =>
      chain.cosmWasm
        ? [
            {
              label: 'Coins',
              value: 0,
            },
            {
              label: 'NFTs',
              value: 1,
            },
            {
              label: 'Activity',
              value: 10,
            },
          ]
        : [
            {
              label: 'Coins',
              value: 0,
            },
            {
              label: 'Activity',
              value: 10,
            },
          ],
    [chain.cosmWasm],
  );

  const [tabValue, setTabValue] = useState(tabLabels.map((item) => item.value).includes(currentTabIndex) ? currentTabIndex : 0);

  const handleChange = useCallback(
    (_: React.SyntheticEvent, newTabValue: number) => {
      setTabValue(newTabValue);

      setCurrentTabIndex(newTabValue);
    },
    [setCurrentTabIndex],
  );

  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();
  const isCustom = useMemo(() => !!currentCosmosAdditionalChains.find((item) => item.id === chain.id), [chain.id, currentCosmosAdditionalChains]);

  useEffect(() => {
    if (!tabLabels.map((item) => item.value).includes(currentTabIndex)) {
      setTabValue(0);
    }
  }, [currentTabIndex, tabLabels]);

  return (
    <Container key={`${chain.id}-${currentAccount.id}`}>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <LedgerCheck>
        {chain.isTerminated ? (
          <TerminatedNativeChainCard chain={chain} isCustom={isCustom} />
        ) : (
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
                <Tab key={item.label} label={item.label} value={item.value} />
              ))}
            </Tabs>
            <StyledTabPanel value={tabValue} index={0}>
              <BottomContainer>
                <ErrorBoundary fallback={<Empty />}>
                  <Suspense fallback={null}>
                    <CoinList chain={chain} />
                  </Suspense>
                </ErrorBoundary>
              </BottomContainer>
            </StyledTabPanel>
            {chain.cosmWasm && (
              <StyledTabPanel value={tabValue} index={1}>
                <BottomContainer>
                  <ErrorBoundary fallback={<Empty />}>
                    <Suspense fallback={null}>
                      <NFTList chain={chain} />
                    </Suspense>
                  </ErrorBoundary>
                </BottomContainer>
              </StyledTabPanel>
            )}
            <StyledTabPanel value={tabValue} index={10}>
              <BottomContainer>
                <ActivityList chain={chain} />
              </BottomContainer>
            </StyledTabPanel>
          </>
        )}
      </LedgerCheck>
    </Container>
  );
}
