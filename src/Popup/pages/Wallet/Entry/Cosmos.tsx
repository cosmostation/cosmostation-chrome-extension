import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import Header from '~/Popup/components/SelectSubHeader';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import type { CosmosChain } from '~/types/chain';

import CoinList from '../components/cosmos/CoinList';
import NativeChainCard, { NativeChainCardError, NativeChainCardSkeleton } from '../components/cosmos/NativeChainCard';
import LedgerCheck from '../components/LedgerCheck';
import { BottomContainer, Container, HeaderContainer, NativeChainCardContainer } from '../styled';

type CosmosProps = {
  chain: CosmosChain;
};

export default function Cosmos({ chain }: CosmosProps) {
  useCoinGeckoPriceSWR();

  const { currentAccount } = useCurrentAccount();

  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();
  const isCustom = useMemo(() => !!currentCosmosAdditionalChains.find((item) => item.id === chain.id), [chain.id, currentCosmosAdditionalChains]);

  return (
    <Container key={`${chain.id}-${currentAccount.id}`}>
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
            <ErrorBoundary fallback={<Empty />}>
              <Suspense fallback={null}>
                <CoinList chain={chain} />
              </Suspense>
            </ErrorBoundary>
          </BottomContainer>
        </>
      </LedgerCheck>
    </Container>
  );
}
