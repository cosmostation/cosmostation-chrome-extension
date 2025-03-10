import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { EthcAddTokens } from '@/types/message/inject/evm';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/evm/add-token/')({
  component: EVMAddTokens,
});

function EVMAddTokens() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isEVMAddTokens(currentRequestQueue)) {
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

function isEVMAddTokens(queue: RequestQueue): queue is EthcAddTokens {
  return queue.method === 'ethc_addTokens';
}
