import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/account/create-wallet/mnemonic/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/account/create-wallet/mnemonic/"!</div>
}
