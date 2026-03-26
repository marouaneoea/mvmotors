import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { normalizeBrand } from '../lib/brands'
import type { Car } from '../types'

// ── Update these with your real contact details ───────────────────────────────
const PHONE        = '+32 485 73 78 45'
const PHONE_HREF   = 'tel:+32485737845'
const WHATSAPP     = 'https://wa.me/32485737845'
const EMAIL        = 'info@mvmotors.be'
// ─────────────────────────────────────────────────────────────────────────────

function Spec({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-dark-700 rounded-lg px-4 py-3">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  )
}

export function CarDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [car, setCar] = useState<Car | null>(null)
  const [suggestions, setSuggestions] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    if (!id || !supabase) return
    setActiveImg(0)
    supabase.from('cars').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setCar({
          ...data,
          brand: normalizeBrand(data.brand),
          priceAllIn: data.price_all_in,
          euroNorm: data.euro_norm,
          firstOwner: data.first_owner,
          features: data.features ?? [],
          images: data.images ?? [],
        })
      }
      setLoading(false)
    })
    supabase.from('cars').select('id, title, brand, image, price, year, mileage, fuel, reserved').neq('id', id).neq('reserved', true).then(({ data }) => {
      if (!data || data.length === 0) return
      const shuffled = data.sort(() => Math.random() - 0.5)
      setSuggestions(shuffled.slice(0, 3).map(r => ({ ...r, brand: normalizeBrand(r.brand) } as Car)))
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <p className="text-gray-500">Laden...</p>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Voertuig niet gevonden.</p>
        <button onClick={() => navigate('/')} className="text-gold-500 hover:underline text-sm">
          Terug naar overzicht
        </button>
      </div>
    )
  }

  const allImages = (car.images && car.images.length > 0) ? car.images : [car.image]
  const whatsappMsg = encodeURIComponent(`Hallo, ik heb interesse in de ${car.title} (€${car.price.toLocaleString('nl-BE')}). Kan ik meer informatie krijgen?`)

  return (
    <>
    <div className="min-h-screen bg-dark-900 text-white">

      {/* Top bar */}
      <div className="bg-dark-800 border-b border-dark-500 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Terug
        </button>
        <span className="text-gold-500 font-bold tracking-widest text-sm">MV MOTORS</span>
        <a href="/#voertuigen" className="text-sm text-gray-400 hover:text-white transition-colors">
          Alle wagens
        </a>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid lg:grid-cols-2 gap-10">

          {/* ── Image gallery ── */}
          <div className="space-y-3">

            {/* Main image with prev/next arrows */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-dark-800 group cursor-zoom-in"
              onClick={() => setLightbox(true)}
            >
              <img
                key={activeImg}
                src={allImages[activeImg]}
                alt={car.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Gradient overlays for arrow contrast */}
              {allImages.length > 1 && (
                <>
                  <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/40 to-transparent" />
                  <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/40 to-transparent" />
                </>
              )}

              {/* Prev arrow */}
              {allImages.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + allImages.length) % allImages.length) }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-dark-900/70 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold-500 hover:border-gold-500"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
              )}

              {/* Next arrow */}
              {allImages.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % allImages.length) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-dark-900/70 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold-500 hover:border-gold-500"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              )}

              {/* Counter badge */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-dark-900/70 border border-white/10 text-white text-xs backdrop-blur-sm">
                  {activeImg + 1} / {allImages.length}
                </div>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                  Klik om te vergroten
                </span>
              </div>

              {car.reserved && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="px-6 py-3 bg-red-600 text-white text-xl font-bold uppercase tracking-wider -rotate-12 shadow-lg">
                    Gereserveerd
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
                {allImages.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      i === activeImg
                        ? 'border-gold-500 shadow-[0_0_0_1px_#c9a84c]'
                        : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {i === 5 && allImages.length > 6 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
                        +{allImages.length - 6}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <a
              href={car.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-gray-600 hover:text-gray-400 transition-colors pt-1"
            >
              Bekijk originele advertentie op 2dehands.be →
            </a>
          </div>

          {/* ── Car details ── */}
          <div className="space-y-6">
            <div>
              <p className="text-gold-500 text-xs uppercase tracking-widest font-semibold mb-1">{car.brand}</p>
              <h1 className="text-2xl font-bold leading-tight mb-3">{car.title}</h1>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-gold-500">
                  €{car.price.toLocaleString('nl-BE')}
                </span>
                {car.priceAllIn && (
                  <span className="text-sm text-gray-500">All-in: €{car.priceAllIn.toLocaleString('nl-BE')}</span>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {car.firstOwner && (
                <span className="px-3 py-1 bg-gold-500/10 text-gold-400 text-xs font-semibold uppercase tracking-wide rounded-full border border-gold-500/20">
                  1ste eigenaar
                </span>
              )}
              {car.warranty && (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wide rounded-full border border-emerald-500/20">
                  {car.warranty} garantie
                </span>
              )}
              {car.reserved && (
                <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-wide rounded-full border border-red-500/20">
                  Gereserveerd
                </span>
              )}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-2">
              {car.year > 0     && <Spec label="Bouwjaar"     value={car.year} />}
              {car.mileage > 0  && <Spec label="Kilometerstand" value={`${car.mileage.toLocaleString('nl-BE')} km`} />}
              {car.fuel         && <Spec label="Brandstof"    value={car.fuel} />}
              {car.transmission && <Spec label="Transmissie"  value={car.transmission} />}
              {car.power        && <Spec label="Vermogen"     value={car.power} />}
              {car.euroNorm     && <Spec label="Euro norm"    value={car.euroNorm} />}
            </div>

            {/* Features */}
            {car.features.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Uitrusting</p>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((f, i) => (
                    <span key={i} className="px-2.5 py-1 bg-dark-700 text-gray-300 text-xs rounded-full border border-dark-500">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="border-t border-dark-500 pt-6 space-y-3">
              <p className="text-sm text-gray-400 mb-4">Interesse in dit voertuig? Neem contact op:</p>

              <a
                href={PHONE_HREF}
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-gold-500 text-dark-900 font-bold uppercase tracking-wider rounded-lg hover:bg-gold-400 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
                </svg>
                Bel ons — {PHONE}
              </a>

              <a
                href={`${WHATSAPP}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#25d366] text-white font-bold uppercase tracking-wider rounded-lg hover:bg-[#20bc5a] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>

              <a
                href={`mailto:${EMAIL}?subject=Interesse in: ${encodeURIComponent(car.title)}`}
                className="flex items-center justify-center gap-3 w-full py-3 border border-dark-500 text-gray-300 font-medium rounded-lg hover:border-gold-500 hover:text-white transition-colors text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {EMAIL}
              </a>

            </div>
          </div>
        </div>
      </div>

      {/* ── Also interesting ── */}
      {suggestions.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16">
          <div className="border-t border-dark-500 pt-10">
            <p className="text-gold-500 text-xs uppercase tracking-[0.2em] font-semibold mb-2 text-center">Bekijk ook</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">Misschien ook interessant</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {suggestions.map(s => (
                <Link
                  key={s.id}
                  to={`/cars/${s.id}`}
                  className="group bg-dark-700 rounded-lg overflow-hidden border border-dark-500 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/40 hover:bg-dark-600"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={s.image}
                      alt={s.title}
                      loading="lazy"
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${s.reserved ? 'grayscale' : ''}`}
                    />
                    {s.reserved && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase tracking-wider -rotate-12">
                          Gereserveerd
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-gold-500 text-[10px] uppercase tracking-[0.2em] font-semibold mb-1">{s.brand}</p>
                    <h3 className="text-sm font-semibold mb-3 leading-tight line-clamp-2">{s.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs text-gray-400">
                      {s.year > 0 && <span>{s.year}</span>}
                      {s.mileage > 0 && <span>{s.mileage.toLocaleString('nl-BE')} km</span>}
                      {s.fuel && <span>{s.fuel}</span>}
                    </div>
                    <span className="text-lg font-bold text-gold-500">
                      €{s.price.toLocaleString('nl-BE')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* ── Lightbox ── */}
    {lightbox && (
      <div
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={() => setLightbox(false)}
      >
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl leading-none"
          onClick={() => setLightbox(false)}
        >
          ×
        </button>

        {/* Prev */}
        {allImages.length > 1 && (
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-3"
            onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + allImages.length) % allImages.length) }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        <img
          src={allImages[activeImg]}
          alt={car.title}
          className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          onClick={e => e.stopPropagation()}
        />

        {/* Next */}
        {allImages.length > 1 && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-3"
            onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % allImages.length) }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {activeImg + 1} / {allImages.length}
          </div>
        )}
      </div>
    )}
    </>
  )
}
