import { createFileRoute } from '@tanstack/react-router'

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue'
import AccessRequest from '@/pages/popup/-components/requests/AccessRequest'
import type { RequestQueue } from '@/types/extension'
import type { GnoSignMessage } from '@/types/message/inject/gno'

import Entry from './-entry'
import Layout from './-layout'

export const Route = createFileRoute('/popup/gno/sign-message/')({
  component: GnoSignMessage,
})

function GnoSignMessage() {
  const { currentRequestQueue } = useCurrentRequestQueue()

  if (currentRequestQueue && isGnoSignMessage(currentRequestQueue)) {
    return (
      <AccessRequest>
        <Layout>
          <Entry request={currentRequestQueue} />
        </Layout>
      </AccessRequest>
    )
  }
  return null
}

function isGnoSignMessage(queue: RequestQueue): queue is GnoSignMessage {
  return queue.method === 'gno_signMessage'
}
