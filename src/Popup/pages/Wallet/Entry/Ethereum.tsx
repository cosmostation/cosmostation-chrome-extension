import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Header from '~/Popup/components/SelectSubHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import type { EthereumChain } from '~/types/chain';

import NativeChainCard, { NativeChainCardSkeleton } from '../components/ethereum/NativeChainCard';
import { Container, HeaderContainer, NativeChainCardContainer } from '../styled';

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
        <ErrorBoundary fallback={<NativeChainCardSkeleton chain={chain} />}>
          <Suspense fallback={<NativeChainCardSkeleton chain={chain} />}>
            <NativeChainCard chain={chain} />
          </Suspense>
        </ErrorBoundary>
      </NativeChainCardContainer>
      {/* <IbcCoinList /> */}
    </Container>
  );
}
