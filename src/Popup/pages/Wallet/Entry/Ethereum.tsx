import { Suspense } from 'react';
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
  const { currentNetwork } = useCurrentEthereumNetwork();

  return (
    <Container key={`${currentAccount.id}-${currentNetwork.id}`}>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <NativeChainCardContainer>
        <ErrorBoundary
          // eslint-disable-next-line react/no-unstable-nested-components
          FallbackComponent={(props) => <NativeChainCardError chain={chain} {...props} />}
        >
          <Suspense fallback={<NativeChainCardSkeleton chain={chain} />}>
            <NativeChainCard chain={chain} />
          </Suspense>
        </ErrorBoundary>
      </NativeChainCardContainer>
      <BottomContainer>
        <TokenList />
      </BottomContainer>
    </Container>
  );
}
