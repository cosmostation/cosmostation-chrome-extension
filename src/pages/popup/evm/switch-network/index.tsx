import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { EthcSwitchNetwork } from '@/types/message/inject/evm';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/evm/switch-network/')({
  component: EVMSwitchChain,
});

function EVMSwitchChain() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isEVMSwitchNetwork(currentRequestQueue)) {
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

function isEVMSwitchNetwork(queue: RequestQueue): queue is EthcSwitchNetwork {
  return queue.method === 'ethc_switchNetwork';
}
