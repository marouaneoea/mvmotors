import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import type { ClickRow } from './shared'
import { TT, SectionTitle, Card, Empty } from './shared'

export function Statistieken({ clicks }: { clicks: ClickRow[] }) {
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    d.setHours(0, 0, 0, 0)
    return d
  })

  const clicksByDay = last14.map(day => {
    const next = new Date(day); next.setDate(next.getDate() + 1)
    return {
      date: day.toLocaleDateString('nl-BE', { month: 'short', day: 'numeric' }),
      klikken: clicks.filter(c => { const t = new Date(c.clicked_at); return t >= day && t < next }).length,
    }
  })

  const topBrands = Object.entries(
    clicks.reduce((acc, c) => { acc[c.brand] = (acc[c.brand] || 0) + 1; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10)

  return (
    <div className="space-y-6">
      <SectionTitle>Statistieken</SectionTitle>

      <Card title="Klikken per dag — laatste 14 dagen">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={clicksByDay} margin={{ left: 0, right: 10 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...TT} />
            <Area type="monotone" dataKey="klikken" stroke="#c9a84c" strokeWidth={2} fill="url(#goldGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Klikken per merk">
        {topBrands.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topBrands} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} width={120} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Bar dataKey="value" name="klikken" fill="#c9a84c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="bg-dark-800 border border-dark-500 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-500">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Recente klikken</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-500 bg-dark-700/50">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">Wagen</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium hidden md:table-cell">Merk</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">Tijdstip</th>
            </tr>
          </thead>
          <tbody>
            {clicks.slice(0, 50).map((c, i) => (
              <tr key={i} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/60 transition-colors">
                <td className="px-4 py-3 text-gray-300 truncate max-w-xs">{c.car_title}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c.brand}</td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(c.clicked_at).toLocaleString('nl-BE')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clicks.length === 0 && <p className="text-center text-gray-600 py-10 text-sm">Nog geen klikken.</p>}
      </div>
    </div>
  )
}
