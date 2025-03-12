import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { AptosSignMessage as AptosRequestSignMessage } from '@/types/message/inject/aptos';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/aptos/sign-message/')({
  component: AptosSignMessage,
});

function AptosSignMessage() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isAptosSignMessage(currentRequestQueue)) {
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

function isAptosSignMessage(queue: RequestQueue): queue is AptosRequestSignMessage {
  return queue.method === 'aptos_signMessage';
}
