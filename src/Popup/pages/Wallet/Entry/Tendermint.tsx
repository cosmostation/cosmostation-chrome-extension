import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import Header from '~/Popup/components/SelectSubHeader';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
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

  const { currentTendermintAdditionalChains } = useCurrentAdditionalChains();
  const isCustom = useMemo(() => !!currentTendermintAdditionalChains.find((item) => item.id === chain.id), [chain.id, currentTendermintAdditionalChains]);

  return (
    <Container key={`${chain.id}-${currentAccount.id}`}>
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
        <ErrorBoundary fallback={<Empty />}>
          <Suspense fallback={null}>
            <IbcCoinList chain={chain} />
          </Suspense>
        </ErrorBoundary>
      </BottomContainer>
    </Container>
  );
}
