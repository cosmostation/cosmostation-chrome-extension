import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import AccessRequest from '@/pages/popup/-components/requests/AccessRequest';
import type { RequestQueue } from '@/types/extension';
import type { EthSignTypedData } from '@/types/message/inject/evm';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/popup/evm/sign/sign-typed-data/')({
  component: EVMSignTypedData,
});

function EVMSignTypedData() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isEVMSignTypedData(currentRequestQueue)) {
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

function isEVMSignTypedData(queue: RequestQueue): queue is EthSignTypedData {
  return queue.method === 'eth_signTypedData_v3' || queue.method === 'eth_signTypedData_v4';
}
