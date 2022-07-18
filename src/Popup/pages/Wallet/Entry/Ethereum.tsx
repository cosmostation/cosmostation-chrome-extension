import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Header from '~/Popup/components/SelectSubHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import type { EthereumChain } from '~/types/chain';

import NativeChainCard, { NativeChainCardError, NativeChainCardSkeleton } from '../components/ethereum/NativeChainCard';
import TokenList from '../components/ethereum/TokenList';
import { BottomContainer, Container, HeaderContainer, NativeChainCardContainer } from '../styled';

type EthereumProps = {
  chain: EthereumChain;
};

export default function Ethereum({ chain }: EthereumProps) {
  const { currentAccount } = useCurrentAccount();
  const { currentEthereumNetwork, additionalEthereumNetworks } = useCurrentEthereumNetwork();

  const isCustom = useMemo(
    () => !!additionalEthereumNetworks.find((item) => item.id === currentEthereumNetwork.id),
    [additionalEthereumNetworks, currentEthereumNetwork.id],
  );

  return (
    <Container key={`${currentAccount.id}-${currentEthereumNetwork.id}`}>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
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
      <BottomContainer>
        <TokenList />
      </BottomContainer>
    </Container>
  );
}
