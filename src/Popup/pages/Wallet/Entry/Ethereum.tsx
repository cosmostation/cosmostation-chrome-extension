import { Suspense, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import { Tab, Tabs } from '~/Popup/components/common/Tab';
import Header from '~/Popup/components/SelectSubHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
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
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { tabPath } = extensionStorage;

  const { currentAccount } = useCurrentAccount();
  const { currentEthereumNetwork, additionalEthereumNetworks } = useCurrentEthereumNetwork();

  const tabLabels = ['Coins', 'NFTs'];

  const currentTabPath = useMemo(
    // NOTE 방어코드 추가할 것
    () => tabPath.ethereum.find((item) => item.networkId === currentEthereumNetwork.id)!,
    [currentEthereumNetwork.id, tabPath.ethereum],
  );

  const [tabValue, setTabValue] = useState(currentTabPath.tabPath);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const isCustom = useMemo(
    () => !!additionalEthereumNetworks.find((item) => item.id === currentEthereumNetwork.id),
    [additionalEthereumNetworks, currentEthereumNetwork.id],
  );

  useEffect(() => {
    if (gte(tabPath.ethereum.find((item) => item.networkId === currentEthereumNetwork.id)?.tabPath || 0, tabLabels.length)) {
      void setExtensionStorage('tabPath', {
        ...tabPath,
        ethereum: tabPath.ethereum.map((item) =>
          item.networkId === currentEthereumNetwork.id
            ? {
                ...item,
                tabPath: 0,
              }
            : item,
        ),
      });

      setTabValue(0);
    }

    void setExtensionStorage('tabPath', {
      ...tabPath,

      ethereum: [
        ...tabPath.ethereum.map((item) =>
          item.networkId === currentEthereumNetwork.id
            ? {
                ...item,
                tabPath: tabValue,
              }
            : item,
        ),
      ],
    });
  }, [currentEthereumNetwork.id, setExtensionStorage, tabLabels.length, tabPath, tabValue]);

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
