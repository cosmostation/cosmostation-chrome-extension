import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import Lock from '~/Popup/components/Lock';

import Entry from './Entry';
import Layout from './layout';

export default function Wallet() {
  return (
    <Lock>
      <Layout>
        <ErrorBoundary fallback={<Empty />}>
          <Suspense fallback={null}>
            <Entry />
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </Lock>
  );
}
