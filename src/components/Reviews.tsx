import { useEffect, useRef, useState } from 'react'
import { getReviews, submitReview } from '../lib/supabase'
import type { Review } from '../lib/supabase'

const TAGS = [
  'Reageert snel', 'Goede prijs/kwaliteit', 'Product zoals omschreven',
  'Vriendelijk', 'Komt afspraken na', "Duidelijke foto's",
  'Deal snel gesloten', 'Goede service', 'Voldoet aan verwachting',
]

// ── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating, size = 5 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-${size} h-${size} ${i <= rating ? 'fill-gold-500' : 'fill-dark-500'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// ── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ review }: { review: Review }) {
  const [err, setErr] = useState(false)
  if (review.reviewer_avatar && !err) {
    return <img src={review.reviewer_avatar} alt={review.reviewer_name} onError={() => setErr(true)} className="w-12 h-12 rounded-full object-cover shrink-0" />
  }
  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shrink-0">
      <span className="text-dark-800 font-bold text-base">{review.reviewer_initials}</span>
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const date = review.date
    ? new Date(review.date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  return (
    <div className="bg-dark-700 border border-dark-500 rounded-2xl p-8 flex flex-col gap-6 w-[420px] shrink-0 snap-start hover:border-gold-500/30 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        {review.car && (
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 bg-dark-600 px-3 py-1 rounded-full">
            {review.car}
          </span>
        )}
      </div>

      <div className="flex-1">
        {review.tags?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {review.tags.map(tag => (
              <span key={tag} className="text-sm px-3 py-1.5 rounded-full bg-dark-800 border border-dark-500 text-gray-200">
                ✓ {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm italic">—</p>
        )}
      </div>

      <div className="flex items-center gap-4 pt-5 border-t border-dark-500">
        <Avatar review={review} />
        <div className="min-w-0 flex-1">
          <p className="text-white font-bold text-base truncate">{review.reviewer_name}</p>
          <p className="text-gray-500 text-sm mt-0.5">{date}</p>
        </div>
        <span className="text-[11px] text-gray-600 shrink-0">
          {review.source === 'website' ? 'MV Motors' : '2dehands'}
        </span>
      </div>
    </div>
  )
}

// ── Submit modal ─────────────────────────────────────────────────────────────

function SubmitModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [car, setCar] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  function toggleTag(tag: string) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setErrMsg('Vul uw naam in'); setStatus('error'); return }
    if (selectedTags.length === 0) { setErrMsg('Selecteer minstens één tag'); setStatus('error'); return }
    setStatus('loading')
    const result = await submitReview({ reviewer_name: name, rating, tags: selectedTags, car })
    if (result.success) {
      setStatus('success')
    } else {
      setStatus('error')
      setErrMsg(result.error || 'Er ging iets mis')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-dark-700 border border-dark-500 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-8">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">Bedankt voor uw review!</h3>
              <p className="text-gray-400 text-sm">Uw review wordt nagekeken en verschijnt binnenkort op de site.</p>
              <button onClick={onClose} className="mt-6 px-6 py-3 bg-gold-500 text-dark-800 font-bold rounded-lg text-sm uppercase tracking-wider hover:bg-gold-400 transition-colors">
                Sluiten
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Schrijf een review</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Uw naam</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jan Janssen"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-500 rounded-lg text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                {/* Star rating */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Beoordeling</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(i => (
                      <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(i)}
                        className="focus:outline-none"
                      >
                        <svg className={`w-8 h-8 transition-colors ${i <= (hoverRating || rating) ? 'fill-gold-500' : 'fill-dark-500'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Wat vond u goed?</label>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-gold-500/10 border-gold-500 text-gold-500'
                            : 'bg-dark-800 border-dark-500 text-gray-400 hover:border-gray-400'
                        }`}
                      >
                        {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Car (optional) */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">Gekochte wagen <span className="text-gray-600 normal-case">(optioneel)</span></label>
                  <input
                    type="text"
                    value={car}
                    onChange={e => setCar(e.target.value)}
                    placeholder="bv. Volkswagen Golf"
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-500 rounded-lg text-white placeholder-gray-600 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                {status === 'error' && <p className="text-red-400 text-sm">{errMsg}</p>}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-4 bg-gold-500 text-dark-800 font-bold uppercase tracking-wider rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50"
                >
                  {status === 'loading' ? 'Versturen...' : 'Review insturen'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main section ─────────────────────────────────────────────────────────────

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getReviews().then(data => { setReviews(data); setLoading(false) })
  }, [])

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 450 : -450, behavior: 'smooth' })
  }

  const totalCount = reviews.length

  return (
    <section id="reviews" className="py-24 bg-dark-900">
      {/* Heading */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <p className="text-gold-500 text-xs font-bold uppercase tracking-widest mb-3">Wat onze klanten zeggen</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h2 className="text-4xl font-bold">Beoordelingen</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Stars rating={5} size={6} />
              <span className="text-white font-bold text-xl">5.0</span>
              {!loading && <span className="text-gray-500 text-sm">· {totalCount} reviews</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-dark-500 flex items-center justify-center text-gray-400 hover:border-gold-500 hover:text-gold-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-dark-500 flex items-center justify-center text-gray-400 hover:border-gold-500 hover:text-gold-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex flex-nowrap gap-6 overflow-x-auto px-6 pb-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading
          ? [...Array(3)].map((_, i) => <div key={i} className="w-[420px] h-56 bg-dark-700 rounded-2xl animate-pulse shrink-0" />)
          : reviews.map(r => <ReviewCard key={r.id} review={r} />)
        }
      </div>

      {/* Write review button */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 border border-dark-500 text-gray-300 hover:border-gold-500 hover:text-gold-500 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Schrijf een review
        </button>
      </div>

      {showModal && <SubmitModal onClose={() => setShowModal(false)} />}
    </section>
  )
}
