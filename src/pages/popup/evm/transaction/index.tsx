import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { EthSendTransaction, EthSignTransaction } from '@/types/message/inject/evm';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/evm/transaction/')({
  component: EVMTransaction,
});

function EVMTransaction() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isEVMTransaction(currentRequestQueue)) {
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

function isEVMTransaction(queue: RequestQueue): queue is EthSignTransaction | EthSendTransaction {
  return queue.method === 'eth_sendTransaction' || queue.method === 'eth_signTransaction';
}
