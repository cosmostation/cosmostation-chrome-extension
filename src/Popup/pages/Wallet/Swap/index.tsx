import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Lock from '~/Popup/components/Lock';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import Entry, { EntryError } from './entry';
import Layout from './layout';

export default function Wallet() {
  const { t } = useTranslation();

  return (
    <Lock>
      <Layout>
        <ErrorBoundary fallback={<EntryError errorMessage={t('pages.Wallet.Swap.index.networkError')} />}>
          <Suspense fallback={<EntryError errorMessage={t('pages.Wallet.Swap.index.fetchingData')} />}>
            <Entry />
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </Lock>
  );
}
