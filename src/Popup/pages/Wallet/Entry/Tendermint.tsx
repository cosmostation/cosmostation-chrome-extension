import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import Header from '~/Popup/components/SelectSubHeader';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import type { TendermintChain } from '~/types/chain';

import IbcCoinList from '../components/tendermint/CoinList';
import NativeChainCard, { NativeChainCardError, NativeChainCardSkeleton } from '../components/tendermint/NativeChainCard';
import { BottomContainer, Container, HeaderContainer, NativeChainCardContainer } from '../styled';

type TendermintProps = {
  chain: TendermintChain;
};

export default function Tendermint({ chain }: TendermintProps) {
  useCoinGeckoPriceSWR();

  const { currentAccount } = useCurrentAccount();

  return (
    <Container key={`${chain.id}-${currentAccount.id}`}>
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
        <ErrorBoundary fallback={<Empty />}>
          <Suspense fallback={null}>
            <IbcCoinList chain={chain} />
          </Suspense>
        </ErrorBoundary>
      </BottomContainer>
    </Container>
  );
}
