import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(groupWithoutPath)/testA')({
  component: () => <div>Hello /(groupWithoutPath)/testA!</div>,
})
