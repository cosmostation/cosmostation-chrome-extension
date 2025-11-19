import { createFileRoute } from '@tanstack/react-router'

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue'
import type { RequestQueue } from '@/types/extension'
import type { SolanaSignMessage as SolanaRequestSignMessage } from '@/types/message/inject/solana'

import Entry from './-entry'
import Layout from './-layout'
import AccessRequest from '../../-components/requests/AccessRequest'

export const Route = createFileRoute('/popup/solana/sign-message/')({
  component: SolanaSignMessage,
})

function SolanaSignMessage() {
  const { currentRequestQueue } = useCurrentRequestQueue()

  if (currentRequestQueue && isSolanaSignMessage(currentRequestQueue)) {
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

function isSolanaSignMessage(
  queue: RequestQueue,
): queue is SolanaRequestSignMessage {
  return queue.method === 'solana_signMessage'
}
