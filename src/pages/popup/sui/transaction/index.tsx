import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { SuiSignAndExecuteTransaction, SuiSignAndExecuteTransactionBlock, SuiSignTransaction, SuiSignTransactionBlock } from '@/types/message/inject/sui';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/sui/transaction/')({
  component: SuiTransaction,
});

function SuiTransaction() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isSuiTransaction(currentRequestQueue)) {
    return (
      <AccessRequest>
        <Layout>
          <Entry request={currentRequestQueue} />
        </Layout>
      </AccessRequest>
    );
  }
  return null;
}

function isSuiTransaction(
  queue: RequestQueue,
): queue is SuiSignAndExecuteTransactionBlock | SuiSignTransactionBlock | SuiSignAndExecuteTransaction | SuiSignTransaction {
  return (
    queue.method === 'sui_signAndExecuteTransactionBlock' ||
    queue.method === 'sui_signTransactionBlock' ||
    queue.method === 'sui_signTransaction' ||
    queue.method === 'sui_signAndExecuteTransaction'
  );
}
