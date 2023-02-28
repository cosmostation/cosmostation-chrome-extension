import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import Lock from '~/Popup/components/Lock';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import Entry from './entry';
import Layout from './layout';

export default function Wallet() {
  const { currentChain } = useCurrentChain();

  return (
    <Lock>
      <Layout>
        <ErrorBoundary fallback={<Empty />}>
          <Suspense fallback={null}>{currentChain.line === 'COSMOS' && <Entry chain={currentChain} />}</Suspense>
        </ErrorBoundary>
      </Layout>
    </Lock>
  );
}
