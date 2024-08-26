import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Header from '~/Popup/components/SelectSubHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import type { BitcoinChain } from '~/types/chain';

import NativeChainCard, { NativeChainCardError, NativeChainCardSkeleton } from '../components/bitcoin/NativeChainCard';
import LedgerCheck from '../components/LedgerCheck';
import { Container, HeaderContainer, NativeChainCardContainer } from '../styled';

type BitcoinProps = {
  chain: BitcoinChain;
};

export default function Bitcoin({ chain }: BitcoinProps) {
  const { currentAccount } = useCurrentAccount();

  return (
    <Container key={`${currentAccount.id}-${chain.id}`}>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <LedgerCheck>
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
      </LedgerCheck>
    </Container>
  );
}
