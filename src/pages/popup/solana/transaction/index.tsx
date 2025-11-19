import { createFileRoute } from '@tanstack/react-router'

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue'
import type { RequestQueue } from '@/types/extension'
import type {
  SolanaSignAllTransactions,
  SolanaSignAndSendAllTransactions,
  SolanaSignAndSendTransaction,
  SolanaSignTransaction,
} from '@/types/message/inject/solana'

import Entry from './-entry'
import Layout from './-layout'
import AccessRequest from '../../-components/requests/AccessRequest'

export const Route = createFileRoute('/popup/solana/transaction/')({
  component: SolanaTransaction,
})

function SolanaTransaction() {
  const { currentRequestQueue } = useCurrentRequestQueue()

  if (currentRequestQueue && isSolanaTransaction(currentRequestQueue)) {
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

function isSolanaTransaction(
  queue: RequestQueue,
): queue is
  | SolanaSignTransaction
  | SolanaSignAllTransactions
  | SolanaSignAndSendTransaction
  | SolanaSignAndSendAllTransactions {
  return (
    queue.method === 'solana_signTransaction' ||
    queue.method === 'solana_signAndSendTransaction' ||
    queue.method === 'solana_signAllTransactions' ||
    queue.method === 'solana_signAndSendAllTransactions'
  )
}
