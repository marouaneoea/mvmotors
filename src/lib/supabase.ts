import { createClient } from '@supabase/supabase-js'

// Supabase config
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function subscribeEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    console.warn('Supabase not configured')
    return { success: false, error: 'Email subscription not available' }
  }

  try {
    const { error } = await supabase
      .from('subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        subscribed_at: new Date().toISOString(),
        source: 'mv-motors-website'
      })

    // Ignore duplicate emails (unique constraint violation)
    if (error && error.code !== '23505') {
      console.error('Supabase error:', error)
      return { success: false, error: `Subscription failed: ${error.message}` }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Subscribe error:', err)
    return { success: false, error: 'Network error. Please try again.' }
  }
}