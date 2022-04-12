import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import type { TendermintChain } from '~/types/chain';

import Header from '../components/Header';
import IbcCoinList from '../components/tendermint/IbcCoinList';
import NativeChainCard, { NativeChainCardSkeleton } from '../components/tendermint/NativeChainCard';
import { Container, HeaderContainer, NativeChainCardContainer } from '../styled';

type TendermintProps = {
  chain: TendermintChain;
};

export default function Tendermint({ chain }: TendermintProps) {
  return (
    <Container>
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
      <ErrorBoundary fallback={<Empty />}>
        <Suspense fallback={null}>
          <IbcCoinList chain={chain} />
        </Suspense>
      </ErrorBoundary>
    </Container>
  );
}
