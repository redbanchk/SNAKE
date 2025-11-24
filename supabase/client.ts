import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

function resolveEnv(key: string) {
  const vite = (import.meta as any)?.env?.[key]
  const win = (window as any)?.[key] || (window as any)?.ENV?.[key]
  const node = (typeof process !== 'undefined' ? (process as any)?.env?.[key] : undefined)
  return vite ?? win ?? node ?? undefined
}

export function getSupabase() {
  const url = resolveEnv('VITE_SUPABASE_URL')
  const anon = resolveEnv('VITE_SUPABASE_ANON_KEY')
  const hasUrl = !!url
  const hasKey = !!anon
  if (!hasUrl || !hasKey) {
    console.error('[Supabase] Missing configuration', { hasUrl, hasKey })
    return null as any
  }
  return createClient<Database>(url as string, anon as string)
}

export const supabase = getSupabase() as ReturnType<typeof getSupabase>
