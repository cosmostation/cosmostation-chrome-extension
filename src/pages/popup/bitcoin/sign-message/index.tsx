import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { BitSignMessage } from '@/types/message/inject/bitcoin';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/bitcoin/sign-message/')({
  component: BitcoinSignMessage,
});

function BitcoinSignMessage() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isBitcoinSignMessage(currentRequestQueue)) {
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

function isBitcoinSignMessage(queue: RequestQueue): queue is BitSignMessage {
  return queue.method === 'bit_signMessage';
}
