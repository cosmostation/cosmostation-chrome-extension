import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Header from '~/Popup/components/SelectSubHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import type { SuiChain } from '~/types/chain';

import LedgerCheck from '../components/LedgerCheck';
import CoinList from '../components/sui/CoinList';
import NativeChainCard, { NativeChainCardError, NativeChainCardSkeleton } from '../components/sui/NativeChainCard';
import { BottomContainer, Container, HeaderContainer, NativeChainCardContainer } from '../styled';

type SuiProps = {
  chain: SuiChain;
};

export default function Sui({ chain }: SuiProps) {
  const { currentAccount } = useCurrentAccount();
  const { currentSuiNetwork, additionalSuiNetworks } = useCurrentSuiNetwork();

  const isCustom = useMemo(() => !!additionalSuiNetworks.find((item) => item.id === currentSuiNetwork.id), [additionalSuiNetworks, currentSuiNetwork.id]);

  return (
    <Container key={`${currentAccount.id}-${currentSuiNetwork.id}`}>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <>
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
        <BottomContainer>
          <CoinList />
        </BottomContainer>
      </>
    </Container>
  );
}
