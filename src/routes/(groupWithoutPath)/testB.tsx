import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(groupWithoutPath)/testB')({
  component: () => <div>Hello /(groupWithoutPath)/testB!</div>,
})
