import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { ClickRow, Subscriber, CarRow } from '../admin/shared'
import { Overzicht } from '../admin/Overzicht'
import { Wagens } from '../admin/Wagens'
import { Facturen } from '../admin/Facturen'
import { Abonnees } from '../admin/Abonnees'
import { Statistieken } from '../admin/Statistieken'
import { AdminReviews } from '../admin/Reviews'

const NAV = [
  { id: 'overzicht', label: 'Overzicht' },
  { id: 'wagens',    label: 'Wagens' },
  { id: 'facturen',  label: 'Facturen' },
  { id: 'abonnees',  label: 'Abonnees' },
  { id: 'reviews',   label: 'Reviews' },
  { id: 'stats',     label: 'Statistieken' },
] as const

type Section = typeof NAV[number]['id']

export function Admin() {
  const navigate = useNavigate()
  const [section, setSection] = useState<Section>('overzicht')
  const [clicks, setClicks] = useState<ClickRow[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [cars, setCars] = useState<CarRow[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileNav, setMobileNav] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: cd }, { data: sd }, { data: crd }] = await Promise.all([
        supabase!.from('car_clicks').select('car_id,car_title,brand,clicked_at').order('clicked_at', { ascending: false }),
        supabase!.from('subscribers').select('email,subscribed_at').order('subscribed_at', { ascending: false }),
        supabase!.from('cars').select('id,brand,model,title,price,year,mileage,reserved,last_updated,power,euro_norm,price_all_in').order('price', { ascending: true }),
      ])
      setClicks(cd ?? [])
      setSubscribers(sd ?? [])
      setCars(crd ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <p className="text-gray-500">Laden...</p>
      </div>
    )
  }

  const sidebarContent = (
    <>
      <div className="px-6 py-6 border-b border-dark-500">
        <div className="text-gold-500 text-xs uppercase tracking-widest mb-1">Admin</div>
        <h1 className="text-base font-bold tracking-wider">MV MOTORS</h1>
      </div>

      <nav className="flex-1 py-3">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => { setSection(item.id); setMobileNav(false) }}
            className={`w-full text-left px-6 py-3 text-sm transition-all relative ${
              section === item.id
                ? 'text-gold-500 bg-gold-500/10 border-r-2 border-gold-500 font-medium'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-dark-500 space-y-3">
        <a href="/" className="block text-xs text-gray-400 hover:text-white transition-colors">
          ← Terug naar site
        </a>
        <button
          onClick={async () => { await supabase?.auth.signOut(); navigate('/login') }}
          className="text-xs text-gray-600 hover:text-red-400 transition-colors"
        >
          Uitloggen
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-dark-900 text-white md:flex">

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-dark-800 border-b border-dark-500 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileNav(v => !v)} className="text-gray-300 hover:text-white p-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileNav ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
        <div>
          <span className="text-gold-500 text-xs uppercase tracking-widest font-semibold">Admin</span>
          <span className="text-white text-xs font-bold tracking-wider ml-2">MV MOTORS</span>
        </div>
        <span className="text-xs text-gray-500">{NAV.find(n => n.id === section)?.label}</span>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileNav && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <aside className="w-64 bg-dark-800 border-r border-dark-500 flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-end px-4 pt-4">
              <button onClick={() => setMobileNav(false)} className="text-gray-400 hover:text-white p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
          <div className="flex-1 bg-black/60" onClick={() => setMobileNav(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 bg-dark-800 border-r border-dark-500 flex-col shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
          {section === 'overzicht'  && <Overzicht clicks={clicks} subscribers={subscribers} />}
          {section === 'wagens'     && <Wagens cars={cars} />}
          {section === 'facturen'   && <Facturen cars={cars} />}
          {section === 'abonnees'   && <Abonnees subscribers={subscribers} />}
          {section === 'reviews'    && <AdminReviews />}
          {section === 'stats'      && <Statistieken clicks={clicks} />}
        </div>
      </main>
    </div>
  )
}
