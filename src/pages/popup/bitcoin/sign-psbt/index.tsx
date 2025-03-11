import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { BitSignPsbt } from '@/types/message/inject/bitcoin';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/bitcoin/sign-psbt/')({
  component: BitcoinSignPsbt,
});

function BitcoinSignPsbt() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isBitcoinSignPsbt(currentRequestQueue)) {
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

function isBitcoinSignPsbt(queue: RequestQueue): queue is BitSignPsbt {
  return queue.method === 'bit_signPsbt';
}
