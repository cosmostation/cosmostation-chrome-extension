import { Suspense, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Header from '~/Popup/components/SelectSubHeader';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { gte } from '~/Popup/utils/big';
import type { CosmosChain } from '~/types/chain';

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

  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { homeTabPath } = extensionStorage;

  const { currentAccount } = useCurrentAccount();

  const tabLabels = ['Coins', 'NFTs'];

  const currentHomeTabPath = useMemo(() => homeTabPath.cosmos.find((item) => item.chainId === chain.id), [chain.id, homeTabPath.cosmos]);

  const [tabValue, setTabValue] = useState(gte(currentHomeTabPath?.tabValue || 0, tabLabels.length) ? currentHomeTabPath?.tabValue || 0 : 0);

  const handleChange = async (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);

    await setExtensionStorage('homeTabPath', {
      ...homeTabPath,

      cosmos: homeTabPath.cosmos.map((item) =>
        item.chainId === chain.id
          ? {
              ...item,
              tabValue: newTabValue,
            }
          : item,
      ),
    });
  };

  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();
  const isCustom = useMemo(() => !!currentCosmosAdditionalChains.find((item) => item.id === chain.id), [chain.id, currentCosmosAdditionalChains]);

  useEffect(() => {
    if (currentHomeTabPath?.tabValue !== tabValue) {
      setTabValue(currentHomeTabPath?.tabValue || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain.id]);

  useEffect(() => {
    if (gte(currentHomeTabPath?.tabValue || 0, tabLabels.length)) {
      void setExtensionStorage('homeTabPath', {
        ...homeTabPath,
        cosmos: homeTabPath.cosmos.map((item) =>
          item.chainId === chain.id
            ? {
                ...item,
                tabValue: 0,
              }
            : item,
        ),
      });
    }
  }, [chain.id, currentHomeTabPath?.tabValue, homeTabPath, setExtensionStorage, tabLabels.length]);

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
        )}
      </LedgerCheck>
    </Container>
  );
}
