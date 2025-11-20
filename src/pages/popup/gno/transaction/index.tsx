import { createFileRoute } from '@tanstack/react-router'

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue'
import AccessRequest from '@/pages/popup/-components/requests/AccessRequest'
import type { RequestQueue } from '@/types/extension'
import type {
  GnoSignAndSendTransaction,
  GnoSignTransaction,
} from '@/types/message/inject/gno'

import Entry from './-entry'
import Layout from './-layout'

export const Route = createFileRoute('/popup/gno/transaction/')({
  component: GnoTransaction,
})

function GnoTransaction() {
  const { currentRequestQueue } = useCurrentRequestQueue()

  if (currentRequestQueue && isGnoTransaction(currentRequestQueue)) {
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

function isGnoTransaction(
  queue: RequestQueue,
): queue is GnoSignAndSendTransaction | GnoSignTransaction {
  return (
    queue.method === 'gno_signAndSendTransaction' ||
    queue.method === 'gno_signTransaction'
  )
}
