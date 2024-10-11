import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/profileA')({
  component: () => <div>Hello /profile/profileA!</div>,
})
