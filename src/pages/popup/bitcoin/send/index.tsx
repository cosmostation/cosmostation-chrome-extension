import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { BitSendBitcoin } from '@/types/message/inject/bitcoin';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/bitcoin/send/')({
  component: BitcoinSend,
});

function BitcoinSend() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isBitcoinSend(currentRequestQueue)) {
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

function isBitcoinSend(queue: RequestQueue): queue is BitSendBitcoin {
  return queue.method === 'bit_sendBitcoin';
}
