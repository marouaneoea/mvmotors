import { useEffect, useState } from 'react'
import { getPendingReviews, getReviews, approveReview, deleteReview } from '../lib/supabase'
import type { Review } from '../lib/supabase'
import { SectionTitle } from './shared'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= rating ? 'fill-gold-500' : 'fill-dark-500'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewRow({
  review,
  onApprove,
  onDelete,
  pending,
}: {
  review: Review
  onApprove?: () => void
  onDelete: () => void
  pending: boolean
}) {
  const date = review.date
    ? new Date(review.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className={`bg-dark-800 border rounded-xl p-5 flex flex-col gap-3 ${pending ? 'border-gold-500/40' : 'border-dark-500'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shrink-0">
              <span className="text-dark-800 font-bold text-xs">{review.reviewer_initials}</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{review.reviewer_name}</p>
              <p className="text-gray-500 text-xs">{date} · {review.car ?? '—'} · <span className="text-gray-600">{review.source}</span></p>
            </div>
          </div>
          <div className="pl-12">
            <Stars rating={review.rating} />
          </div>
        </div>
        {pending && (
          <span className="shrink-0 text-[10px] uppercase tracking-widest font-bold text-gold-500 bg-gold-500/10 border border-gold-500/30 px-2 py-1 rounded-full">
            Wacht op goedkeuring
          </span>
        )}
      </div>

      {review.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-12">
          {review.tags.map(tag => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-dark-700 border border-dark-500 text-gray-400">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pl-12 pt-1">
        {onApprove && (
          <button
            onClick={onApprove}
            className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            ✓ Goedkeuren
          </button>
        )}
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          Verwijderen
        </button>
      </div>
    </div>
  )
}

export function AdminReviews() {
  const [pending, setPending] = useState<Review[]>([])
  const [approved, setApproved] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const [p, a] = await Promise.all([getPendingReviews(), getReviews()])
    setPending(p)
    setApproved(a)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleApprove(id: string) {
    await approveReview(id)
    await load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Review verwijderen?')) return
    await deleteReview(id)
    await load()
  }

  if (loading) return <p className="text-gray-500 text-sm py-10">Laden...</p>

  return (
    <div className="space-y-10">
      {/* Pending */}
      <div>
        <SectionTitle>
          Wachten op goedkeuring
          {pending.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gold-500 bg-gold-500/10 px-2.5 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </SectionTitle>
        {pending.length === 0 ? (
          <p className="text-gray-600 text-sm py-6 text-center border border-dark-500 rounded-xl">
            Geen reviews in afwachting.
          </p>
        ) : (
          <div className="space-y-4">
            {pending.map(r => (
              <ReviewRow
                key={r.id}
                review={r}
                pending
                onApprove={() => handleApprove(r.id)}
                onDelete={() => handleDelete(r.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Approved */}
      <div>
        <SectionTitle>Goedgekeurde reviews ({approved.length})</SectionTitle>
        {approved.length === 0 ? (
          <p className="text-gray-600 text-sm py-6 text-center border border-dark-500 rounded-xl">
            Nog geen goedgekeurde reviews.
          </p>
        ) : (
          <div className="space-y-4">
            {approved.map(r => (
              <ReviewRow
                key={r.id}
                review={r}
                pending={false}
                onDelete={() => handleDelete(r.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
