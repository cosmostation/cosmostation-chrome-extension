import { createFileRoute } from '@tanstack/react-router'

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue'
import type { RequestQueue } from '@/types/extension'
import type { GnoSwitchNetwork } from '@/types/message/inject/gno'

import Entry from './-entry'
import Layout from './-layout'
import AccessRequest from '../../-components/requests/AccessRequest'

export const Route = createFileRoute('/popup/gno/switch-network/')({
  component: GnoSwitchChain,
})

function GnoSwitchChain() {
  const { currentRequestQueue } = useCurrentRequestQueue()

  if (currentRequestQueue && isGnoSwitchNetwork(currentRequestQueue)) {
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

function isGnoSwitchNetwork(queue: RequestQueue): queue is GnoSwitchNetwork {
  return queue.method === 'gno_switchNetwork'
}
