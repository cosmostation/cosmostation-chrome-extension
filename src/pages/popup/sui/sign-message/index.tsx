import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { SuiSignMessage as SuiRequestSignMessage, SuiSignPersonalMessage } from '@/types/message/inject/sui';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/sui/sign-message/')({
  component: SuiSignMessage,
});

function SuiSignMessage() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isSuiSignMessage(currentRequestQueue)) {
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

function isSuiSignMessage(queue: RequestQueue): queue is SuiRequestSignMessage | SuiSignPersonalMessage {
  return queue.method === 'sui_signMessage' || queue.method === 'sui_signPersonalMessage';
}
