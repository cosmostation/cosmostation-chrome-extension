import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import AccessRequest from '@/pages/popup/-components/requests/AccessRequest';
import type { RequestQueue } from '@/types/extension';
import type { EthSign } from '@/types/message/inject/evm';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/popup/evm/sign/eth-sign/')({
  component: EVMSign,
});

function EVMSign() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isEVMSign(currentRequestQueue)) {
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

function isEVMSign(queue: RequestQueue): queue is EthSign {
  return queue.method === 'eth_sign';
}
