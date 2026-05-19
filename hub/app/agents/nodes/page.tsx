import { redirect } from 'next/navigation'

export default function NodesRedirect() {
  redirect('/agents?tab=registry')
}
