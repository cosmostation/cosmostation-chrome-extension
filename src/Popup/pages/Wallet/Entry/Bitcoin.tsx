import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Header from '~/Popup/components/SelectSubHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import type { BitcoinChain } from '~/types/chain';

import NativeChainCard, { NativeChainCardError, NativeChainCardSkeleton } from '../components/bitcoin/NativeChainCard';
import LedgerCheck from '../components/LedgerCheck';
import { Container, HeaderContainer, NativeChainCardContainer } from '../styled';

type BitcoinProps = {
  chain: BitcoinChain;
};

export default function Bitcoin({ chain }: BitcoinProps) {
  const { currentAccount } = useCurrentAccount();
  const { currentSuiNetwork, additionalSuiNetworks } = useCurrentSuiNetwork();

  const isCustom = useMemo(() => !!additionalSuiNetworks.find((item) => item.id === currentSuiNetwork.id), [additionalSuiNetworks, currentSuiNetwork.id]);

  return (
    <Container key={`${currentAccount.id}-${currentSuiNetwork.id}`}>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <LedgerCheck>
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
      </LedgerCheck>
    </Container>
  );
}
