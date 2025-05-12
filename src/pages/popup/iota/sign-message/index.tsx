import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { IotaSignPersonalMessage } from '@/types/message/inject/iota';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/iota/sign-message/')({
  component: IotaSignMessage,
});

function IotaSignMessage() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isIotaSignMessage(currentRequestQueue)) {
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

function isIotaSignMessage(queue: RequestQueue): queue is IotaSignPersonalMessage {
  return queue.method === 'iota_signPersonalMessage';
}
