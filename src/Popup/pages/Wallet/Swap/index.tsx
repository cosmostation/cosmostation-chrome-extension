import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Lock from '~/Popup/components/Lock';

import Entry, { EntryError } from './entry';
import Layout from './layout';

export default function Wallet() {
  return (
    <Lock>
      <Layout>
        <ErrorBoundary fallback={<EntryError />}>
          <Suspense fallback={null}>
            <Entry />
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </Lock>
  );
}
