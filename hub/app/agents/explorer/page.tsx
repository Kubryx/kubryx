import { redirect } from 'next/navigation'

export default function ExplorerRedirect() {
  redirect('/agents?tab=jobs')
}
