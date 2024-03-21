import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Header from '~/Popup/components/SelectSubHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import type { AptosChain } from '~/types/chain';

import CoinList from '../components/aptos/CoinList';
import NativeChainCard, { NativeChainCardError, NativeChainCardSkeleton } from '../components/aptos/NativeChainCard';
import LedgerCheck from '../components/LedgerCheck';
import { BottomContainer, Container, HeaderContainer, NativeChainCardContainer } from '../styled';

type AptosProps = {
  chain: AptosChain;
};

export default function Aptos({ chain }: AptosProps) {
  const { currentAccount } = useCurrentAccount();
  const { currentAptosNetwork, additionalAptosNetworks } = useCurrentAptosNetwork();

  const isCustom = useMemo(
    () => !!additionalAptosNetworks.find((item) => item.id === currentAptosNetwork.id),
    [additionalAptosNetworks, currentAptosNetwork.id],
  );

  return (
    <Container key={`${currentAccount.id}-${currentAptosNetwork.id}`}>
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
          <BottomContainer>
            <CoinList />
          </BottomContainer>
        </>
      </LedgerCheck>
    </Container>
  );
}
