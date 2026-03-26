import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CarRow } from './shared'
import { SectionTitle } from './shared'

interface EditForm {
  model: string
  power: string
  euro_norm: string
  price_all_in: string
  reserved: boolean
}

function guessModel(title: string): string {
  const words = title.trim().split(/\s+/)
  return words[1] ?? ''
}

function CarEditModal({
  car,
  onClose,
  onSaved,
}: {
  car: CarRow
  onClose: () => void
  onSaved: (updated: Partial<CarRow>) => void
}) {
  const [form, setForm] = useState<EditForm>({
    model: car.model || guessModel(car.title),
    power: car.power ?? '',
    euro_norm: car.euro_norm ?? '',
    price_all_in: car.price_all_in != null ? String(car.price_all_in) : '',
    reserved: car.reserved,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    const patch = {
      model: form.model.trim(),
      power: form.power.trim() || null,
      euro_norm: form.euro_norm.trim() || null,
      price_all_in: form.price_all_in.trim() ? Number(form.price_all_in) : null,
      reserved: form.reserved,
    }
    const { error: err } = await supabase!.from('cars').update(patch).eq('id', car.id)
    if (err) { setError(err.message); setSaving(false); return }
    onSaved(patch)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-dark-800 border border-dark-500 rounded-xl w-full max-w-md p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div>
          <p className="text-xs text-gold-500 uppercase tracking-widest mb-1">{car.brand}</p>
          <h2 className="text-base font-semibold leading-tight">{car.title}</h2>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">Model</span>
            <input
              type="text"
              placeholder="bijv. Golf"
              value={form.model}
              onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
              className="w-full px-3 py-2.5 bg-dark-700 border border-dark-500 text-white rounded-lg focus:border-gold-500 focus:outline-none text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">Vermogen</span>
            <input
              type="text"
              placeholder="bijv. 150 pk / 110 kW"
              value={form.power}
              onChange={e => setForm(f => ({ ...f, power: e.target.value }))}
              className="w-full px-3 py-2.5 bg-dark-700 border border-dark-500 text-white rounded-lg focus:border-gold-500 focus:outline-none text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">Euro norm</span>
            <input
              type="text"
              placeholder="bijv. Euro 6"
              value={form.euro_norm}
              onChange={e => setForm(f => ({ ...f, euro_norm: e.target.value }))}
              className="w-full px-3 py-2.5 bg-dark-700 border border-dark-500 text-white rounded-lg focus:border-gold-500 focus:outline-none text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1.5">Prijs all-in (€)</span>
            <input
              type="number"
              placeholder="bijv. 12500"
              value={form.price_all_in}
              onChange={e => setForm(f => ({ ...f, price_all_in: e.target.value }))}
              className="w-full px-3 py-2.5 bg-dark-700 border border-dark-500 text-white rounded-lg focus:border-gold-500 focus:outline-none text-sm"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Gereserveerd</span>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, reserved: !f.reserved }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.reserved ? 'bg-red-500' : 'bg-dark-500'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.reserved ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-dark-500 text-gray-400 rounded-lg hover:border-gray-400 hover:text-white transition-colors text-sm"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-gold-500 text-dark-900 font-bold rounded-lg hover:bg-gold-400 transition-colors text-sm disabled:opacity-50"
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Wagens({ cars: initialCars }: { cars: CarRow[] }) {
  const [cars, setCars] = useState(initialCars)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<CarRow | null>(null)

  const filtered = cars.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.brand.toLowerCase().includes(search.toLowerCase())
  )
  const available = cars.filter(c => !c.reserved).length

  function handleSaved(id: string, patch: Partial<CarRow>) {
    setCars(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <SectionTitle>Wagens</SectionTitle>
        <div className="flex gap-2 text-sm sm:mb-6">
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">{available} beschikbaar</span>
          <span className="px-2.5 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">{cars.length - available} gereserveerd</span>
        </div>
      </div>

      <input
        type="text"
        placeholder="Zoek op merk of titel..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-3 bg-dark-800 border border-dark-500 text-white rounded-lg focus:border-gold-500 focus:outline-none text-sm"
      />

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filtered.map((car) => (
          <div key={car.id} className="bg-dark-800 border border-dark-500 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-gold-500 text-xs mb-0.5">{car.brand}</p>
                <p className="text-white text-sm font-medium leading-tight">{car.title}</p>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${car.reserved ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {car.reserved ? 'Geresv.' : 'Beschikb.'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="text-gold-500 font-semibold text-sm">€{car.price.toLocaleString('nl-BE')}</span>
                <span>{car.year}</span>
                <span>{car.mileage.toLocaleString('nl-BE')} km</span>
              </div>
              <button
                onClick={() => setEditing(car)}
                className="text-xs text-gray-500 hover:text-gold-500 transition-colors px-2 py-1 rounded hover:bg-gold-500/10"
              >
                Bewerken
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-600 py-10 text-sm">Geen wagens gevonden.</p>}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-dark-800 border border-dark-500 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-500 bg-dark-700/50">
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">Voertuig</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">Prijs</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">Jaar</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium hidden lg:table-cell">KM</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((car) => (
              <tr key={car.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/60 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-gold-500 text-xs mb-0.5">{car.brand}</div>
                  <div className="text-white font-medium truncate max-w-xs">{car.title}</div>
                </td>
                <td className="px-4 py-3 text-gold-500 font-semibold whitespace-nowrap">€{car.price.toLocaleString('nl-BE')}</td>
                <td className="px-4 py-3 text-gray-400">{car.year}</td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell whitespace-nowrap">{car.mileage.toLocaleString('nl-BE')} km</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${car.reserved ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {car.reserved ? 'Gereserveerd' : 'Beschikbaar'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditing(car)}
                    className="text-xs text-gray-500 hover:text-gold-500 transition-colors px-2 py-1 rounded hover:bg-gold-500/10"
                  >
                    Bewerken
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-600 py-10 text-sm">Geen wagens gevonden.</p>}
      </div>

      {editing && (
        <CarEditModal
          car={editing}
          onClose={() => setEditing(null)}
          onSaved={(patch) => { handleSaved(editing.id, patch); setEditing(null) }}
        />
      )}
    </div>
  )
}
