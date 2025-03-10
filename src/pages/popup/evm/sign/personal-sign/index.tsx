import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import AccessRequest from '@/pages/popup/-components/requests/AccessRequest';
import type { RequestQueue } from '@/types/extension';
import type { PersonalSign } from '@/types/message/inject/evm';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/popup/evm/sign/personal-sign/')({
  component: EVMPersonalSign,
});

function EVMPersonalSign() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isEVMPersonalSign(currentRequestQueue)) {
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

function isEVMPersonalSign(queue: RequestQueue): queue is PersonalSign {
  return queue.method === 'personal_sign';
}
