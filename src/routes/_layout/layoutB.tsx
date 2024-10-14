import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/layoutB')({
  component: () => <div>Hello /_layout/layoutB!</div>,
})
