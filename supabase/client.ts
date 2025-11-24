import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const url = (import.meta as any)?.env?.VITE_SUPABASE_URL || (window as any)?.VITE_SUPABASE_URL || (window as any)?.ENV?.VITE_SUPABASE_URL
const key = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || (window as any)?.VITE_SUPABASE_ANON_KEY || (window as any)?.ENV?.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient<Database>(url, key) : undefined as any
