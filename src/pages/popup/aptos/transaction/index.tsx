import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { AptosSignTransaction } from '@/types/message/inject/aptos';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/aptos/transaction/')({
  component: AptosTransaction,
});

function AptosTransaction() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isAptosTransaction(currentRequestQueue)) {
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

function isAptosTransaction(queue: RequestQueue): queue is AptosSignTransaction {
  return queue.method === 'aptos_signTransaction';
}
