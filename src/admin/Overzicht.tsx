import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import type { ClickRow, Subscriber } from './shared'
import { PALETTE, TT, startOf, StatCard, SectionTitle, Card, Empty } from './shared'

export function Overzicht({ clicks, subscribers }: { clicks: ClickRow[]; subscribers: Subscriber[] }) {
  const subsToday = subscribers.filter(s => new Date(s.subscribed_at) >= startOf('day')).length
  const subsWeek = subscribers.filter(s => new Date(s.subscribed_at) >= startOf('week')).length
  const subsMonth = subscribers.filter(s => new Date(s.subscribed_at) >= startOf('month')).length

  const topCars = Object.values(
    clicks.reduce((acc, c) => {
      if (!acc[c.car_id]) acc[c.car_id] = { name: c.car_title, clicks: 0 }
      acc[c.car_id].clicks++
      return acc
    }, {} as Record<string, { name: string; clicks: number }>)
  ).sort((a, b) => b.clicks - a.clicks).slice(0, 8)
    .map(c => ({ ...c, name: c.name.length > 25 ? c.name.slice(0, 25) + '…' : c.name }))

  const brandData = Object.entries(
    clicks.reduce((acc, c) => { acc[c.brand] = (acc[c.brand] || 0) + 1; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      <SectionTitle>Overzicht</SectionTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Abonnees vandaag" value={subsToday} />
        <StatCard label="Abonnees deze week" value={subsWeek} />
        <StatCard label="Abonnees deze maand" value={subsMonth} />
        <StatCard label="Totale klikken" value={clicks.length} />
      </div>

      <Card title="Meest bekeken wagens">
        {topCars.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCars} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} width={150} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Bar dataKey="clicks" fill="#c9a84c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Populariteit per merk">
          {brandData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={Math.max(320, brandData.length * 28)}>
              <PieChart>
                <Pie data={brandData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={35}
                  label={({ name, percent, x, y, textAnchor }) => (
                    <text x={x} y={y} textAnchor={textAnchor} fill="#9ca3af" fontSize={11} dominantBaseline="central">
                      {name} {((percent ?? 0) * 100).toFixed(0)}%
                    </text>
                  )} labelLine={{ stroke: '#4b5563', strokeWidth: 1 }}>
                  {brandData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip {...TT} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title={`Recente abonnees (${subscribers.length} totaal)`}>
          {subscribers.length === 0 ? <Empty /> : (
            <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
              {subscribers.slice(0, 20).map((sub, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-dark-600 last:border-0">
                  <span className="text-sm text-gray-300 truncate mr-4">{sub.email}</span>
                  <span className="text-xs text-gray-600 shrink-0">{new Date(sub.subscribed_at).toLocaleDateString('nl-BE')}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
