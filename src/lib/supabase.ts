import { createClient } from '@supabase/supabase-js'

// Supabase config
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface Review {
  id: string
  reviewer_name: string
  reviewer_initials: string
  reviewer_avatar: string | null
  rating: number
  tags: string[]
  car: string | null
  date: string | null
  approved: boolean
  source: string
  created_at: string
}

export async function getReviews(): Promise<Review[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('date', { ascending: false })
  if (error) {
    console.error('Failed to fetch reviews:', error)
    return []
  }
  return data ?? []
}

export async function submitReview(payload: {
  reviewer_name: string
  rating: number
  tags: string[]
  car: string
}): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Niet beschikbaar' }
  const name = payload.reviewer_name.trim()
  const parts = name.split(/\s+/)
  const initials = parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  const { error } = await supabase.from('reviews').insert({
    id: crypto.randomUUID(),
    reviewer_name: name,
    reviewer_initials: initials,
    reviewer_avatar: null,
    rating: payload.rating,
    tags: payload.tags,
    car: payload.car || null,
    date: new Date().toISOString(),
    approved: false,
    source: 'website',
  })
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function getPendingReviews(): Promise<Review[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function approveReview(id: string): Promise<void> {
  await supabase?.from('reviews').update({ approved: true }).eq('id', id)
}

export async function deleteReview(id: string): Promise<void> {
  await supabase?.from('reviews').delete().eq('id', id)
}

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