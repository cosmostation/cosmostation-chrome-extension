import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { IotaSignAndExecuteTransaction, IotaSignTransaction } from '@/types/message/inject/iota';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/iota/transaction/')({
  component: IotaTransaction,
});

function IotaTransaction() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isIotaTransaction(currentRequestQueue)) {
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

function isIotaTransaction(queue: RequestQueue): queue is IotaSignAndExecuteTransaction | IotaSignTransaction {
  return queue.method === 'iota_signTransaction' || queue.method === 'iota_signAndExecuteTransaction';
}
