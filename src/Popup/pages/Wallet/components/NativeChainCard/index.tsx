import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import EthereumNativeChainCard, { EthereumNativeChainCardSkeleton } from './EthereumNativeChainCard';
import TendermintNativeChainCard, { TendermintNativeChainCardSkeleton } from './TendermintNativeChainCard';

export default function NativeChainCard() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'TENDERMINT') {
    return (
      <ErrorBoundary fallback={<TendermintNativeChainCardSkeleton chain={currentChain} />}>
        <Suspense fallback={<TendermintNativeChainCardSkeleton chain={currentChain} />}>
          <TendermintNativeChainCard chain={currentChain} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (currentChain.line === 'ETHEREUM') {
    return (
      <ErrorBoundary fallback={<EthereumNativeChainCardSkeleton chain={currentChain} />}>
        <Suspense fallback={<EthereumNativeChainCardSkeleton chain={currentChain} />}>
          <EthereumNativeChainCard chain={currentChain} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return null;
}
