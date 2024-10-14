import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/Home')({
  component: () => <div>Hello /Home!</div>,
})
