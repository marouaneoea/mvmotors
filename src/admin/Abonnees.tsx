import { useState } from 'react'
import type { Subscriber } from './shared'
import { startOf, StatCard, SectionTitle } from './shared'

export function Abonnees({ subscribers }: { subscribers: Subscriber[] }) {
  const [search, setSearch] = useState('')
  const filtered = subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <SectionTitle>Abonnees</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Vandaag" value={subscribers.filter(s => new Date(s.subscribed_at) >= startOf('day')).length} />
        <StatCard label="Deze week" value={subscribers.filter(s => new Date(s.subscribed_at) >= startOf('week')).length} />
        <StatCard label="Deze maand" value={subscribers.filter(s => new Date(s.subscribed_at) >= startOf('month')).length} />
      </div>

      <input
        type="text"
        placeholder="Zoek op e-mailadres..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-3 bg-dark-800 border border-dark-500 text-white rounded-lg focus:border-gold-500 focus:outline-none text-sm"
      />

      <div className="bg-dark-800 border border-dark-500 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-500 bg-dark-700/50">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">E-mailadres</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">Ingeschreven op</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub, i) => (
              <tr key={i} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/60 transition-colors">
                <td className="px-3 sm:px-4 py-3 text-gray-300 truncate max-w-[200px] sm:max-w-none">{sub.email}</td>
                <td className="px-3 sm:px-4 py-3 text-gray-500 text-xs sm:text-sm whitespace-nowrap">{new Date(sub.subscribed_at).toLocaleDateString('nl-BE')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-600 py-10 text-sm">Geen abonnees gevonden.</p>}
      </div>
    </div>
  )
}
