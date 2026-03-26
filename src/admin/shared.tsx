export interface ClickRow { car_id: string; car_title: string; brand: string; clicked_at: string }
export interface Subscriber { email: string; subscribed_at: string }
export interface CarRow {
  id: string; brand: string; model: string; title: string; price: number; year: number; mileage: number
  reserved: boolean; last_updated: string
  power: string | null; euro_norm: string | null; price_all_in: number | null
}

export const PALETTE = ['#c9a84c', '#d4a855', '#a08030', '#e5c87a', '#8b6f35', '#b8913e', '#f0d9a0', '#6b5520']
export const TT = {
  contentStyle: { background: '#1e1e1e', border: '1px solid #333', borderRadius: 8 },
  labelStyle: { color: '#fff' },
  itemStyle: { color: '#c9a84c' },
}

export function startOf(unit: 'day' | 'week' | 'month') {
  const d = new Date()
  if (unit === 'day') d.setHours(0, 0, 0, 0)
  if (unit === 'week') { d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0) }
  if (unit === 'month') { d.setDate(1); d.setHours(0, 0, 0, 0) }
  return d
}

export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-dark-800 border border-dark-500 rounded-xl p-3 sm:p-5">
      <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mb-2 sm:mb-3">{label}</p>
      <p className="text-2xl sm:text-4xl font-bold text-gold-500">{value}</p>
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-white mb-6">{children}</h2>
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-dark-800 border border-dark-500 rounded-xl p-4 sm:p-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 sm:mb-6">{title}</h3>
      {children}
    </div>
  )
}

export function Empty() {
  return <p className="text-gray-600 text-sm text-center py-10">Nog geen data beschikbaar.</p>
}
