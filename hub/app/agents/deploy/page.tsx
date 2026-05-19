import { redirect } from 'next/navigation'

export default function DeployRedirect() {
  redirect('/agents?tab=deploy')
}
