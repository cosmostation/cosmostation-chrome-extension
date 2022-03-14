import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import CosmosNativeChainCard, { CosmosNativeChainCardSkeleton } from './CosmosNativeChainCard';
import EthereumNativeChainCard, { EthereumNativeChainCardSkeleton } from './EthereumNativeChainCard';

export default function NativeChainCard() {
  const { currentChain } = useCurrentChain();

  if (currentChain.line === 'COSMOS') {
    return (
      <ErrorBoundary fallback={<CosmosNativeChainCardSkeleton chain={currentChain} />}>
        <Suspense fallback={<CosmosNativeChainCardSkeleton chain={currentChain} />}>
          <CosmosNativeChainCard chain={currentChain} />
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
