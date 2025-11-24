import { createClient } from '@supabase/supabase-js'
export function getSupabase() {
  const viteUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL
  const viteKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY
  const nodeUrl = (typeof process !== 'undefined' ? (process as any)?.env?.VITE_SUPABASE_URL : undefined)
  const nodeKey = (typeof process !== 'undefined' ? (process as any)?.env?.VITE_SUPABASE_ANON_KEY : undefined)
  const winUrl = (typeof window !== 'undefined' ? (window as any)?.VITE_SUPABASE_URL || (window as any)?.ENV?.VITE_SUPABASE_URL : undefined)
  const winKey = (typeof window !== 'undefined' ? (window as any)?.VITE_SUPABASE_ANON_KEY || (window as any)?.ENV?.VITE_SUPABASE_ANON_KEY : undefined)
  const url = viteUrl ?? nodeUrl ?? winUrl
  const anon = viteKey ?? nodeKey ?? winKey
  const hasUrl = !!url
  const hasKey = !!anon
  if (!hasUrl || !hasKey) {
    console.error(`[Supabase] Missing configuration url=${hasUrl} key=${hasKey}`)
    return null as any
  }
  return createClient<Database>(url as string, anon as string)
}

export const supabase = getSupabase() as ReturnType<typeof getSupabase>
