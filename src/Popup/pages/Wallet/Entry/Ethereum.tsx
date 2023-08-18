import { Suspense, useCallback, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Header from '~/Popup/components/SelectSubHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentTabIndex } from '~/Popup/hooks/useCurrent/useCurrentTabIndex';
import { gte } from '~/Popup/utils/big';
import type { EthereumChain } from '~/types/chain';

import NativeChainCard, { NativeChainCardError, NativeChainCardSkeleton } from '../components/ethereum/NativeChainCard';
import NFTList from '../components/ethereum/NFTList';
import TokenList from '../components/ethereum/TokenList';
import LedgerCheck from '../components/LedgerCheck';
import { BottomContainer, Container, HeaderContainer, NativeChainCardContainer, StyledTabPanel } from '../styled';

type EthereumProps = {
  chain: EthereumChain;
};

export default function Ethereum({ chain }: EthereumProps) {
  const { currentTabIndex, setCurrentTabIndex } = useCurrentTabIndex();

  const { currentAccount } = useCurrentAccount();
  const { currentEthereumNetwork, additionalEthereumNetworks } = useCurrentEthereumNetwork();

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

  const isCustom = useMemo(
    () => !!additionalEthereumNetworks.find((item) => item.id === currentEthereumNetwork.id),
    [additionalEthereumNetworks, currentEthereumNetwork.id],
  );

  return (
    <Container key={`${currentAccount.id}-${currentEthereumNetwork.id}`}>
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
              <TokenList />
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
