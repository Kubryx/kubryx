// Built by vsrupeshkumar
'use client'

import { usePathname } from 'next/navigation'
import { getToolByRoute, ToolConfig } from '@/lib/tools'

/** Returns the tool metadata for the route currently being viewed. */
export function useToolInfo(): ToolConfig | null {
  const pathname = usePathname()
  const route = '/' + (pathname?.split('/')[1] ?? '')
  return getToolByRoute(route) ?? null
}
