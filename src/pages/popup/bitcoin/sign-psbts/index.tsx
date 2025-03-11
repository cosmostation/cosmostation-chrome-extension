import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { BitSignPsbts } from '@/types/message/inject/bitcoin';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/bitcoin/sign-psbts/')({
  component: BitcoinSignPsbts,
});

function BitcoinSignPsbts() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isBitcoinSignPsbts(currentRequestQueue)) {
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

function isBitcoinSignPsbts(queue: RequestQueue): queue is BitSignPsbts {
  return queue.method === 'bit_signPsbts';
}
