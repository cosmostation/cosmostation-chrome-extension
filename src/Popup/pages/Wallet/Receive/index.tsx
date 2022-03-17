import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Lock from '~/Popup/components/Lock';

import Entry from './Entry';
import Layout from './layout';

export default function Wallet() {
  return (
    <Lock>
      <Layout>
        <ErrorBoundary
          fallback={
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <></>
          }
        >
          <Suspense fallback={null}>
            <Entry />
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </Lock>
  );
}
