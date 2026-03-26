import { useEffect, useState } from 'react'
import { useFactuur } from '../hooks/useFactuur'
import type { CarRow } from './shared'
import { startOf, StatCard, SectionTitle } from './shared'

export function Facturen({ cars }: { cars: CarRow[] }) {
  const { generateFactuur, loading, error, facturen, facturenLoading, loadFacturen, getDownloadUrl, sendFactuur, sending } = useFactuur()
  const [sendEmailInput, setSendEmailInput] = useState<Record<string, string>>({})
  const [sendingFor, setSendingFor] = useState<string | null>(null)
  const [selectedCarId, setSelectedCarId] = useState('')
  const [klantNaam, setKlantNaam] = useState('')
  const [klantAdres, setKlantAdres] = useState('')
  const [klantBtw, setKlantBtw] = useState('')
  const [chassisnummer, setChassisnummer] = useState('')
  const [customPrijs, setCustomPrijs] = useState('')
  const [klantEmail, setKlantEmail] = useState('')
  const [extra, setExtra] = useState('')
  const [success, setSuccess] = useState('')
  const [sortNewest, setSortNewest] = useState(true)

  useEffect(() => { loadFacturen() }, [])

  const selectedCar = cars.find(c => c.id === selectedCarId)

  useEffect(() => {
    if (selectedCar) {
      setCustomPrijs(String(selectedCar.price))
    }
  }, [selectedCarId])

  async function handleGenerate() {
    if (!selectedCar || !klantNaam.trim()) return
    setSuccess('')

    const titleWords = selectedCar.title.trim().split(/\s+/)
    const merk = selectedCar.brand || titleWords[0] || ''
    const model = selectedCar.model || titleWords.slice(1).join(' ') || ''

    const ok = await generateFactuur({
      klant: {
        naam: klantNaam.trim(),
        ...(klantAdres.trim() && { adres: klantAdres.trim() }),
        ...(klantBtw.trim() && { btw: klantBtw.trim() }),
        ...(klantEmail.trim() && { email: klantEmail.trim() }),
      },
      auto: {
        merk,
        model,
        ...(chassisnummer.trim() && { chassisnummer: chassisnummer.trim() }),
        ...(selectedCar.year > 0 && { bouwjaar: selectedCar.year }),
        ...(selectedCar.mileage > 0 && { kilometerstand: selectedCar.mileage }),
      },
      prijs: Number(customPrijs) || selectedCar.price,
      ...(extra.trim() && { extra: extra.trim() }),
    })

    if (ok) {
      setSuccess('Factuur aangemaakt en gedownload!')
      setKlantNaam('')
      setKlantAdres('')
      setKlantBtw('')
      setChassisnummer('')
      setKlantEmail('')
      setExtra('')
      setSelectedCarId('')
      setCustomPrijs('')
      loadFacturen()
    }
  }

  const sortedFacturen = [...facturen].sort((a, b) => {
    const da = new Date(a.created || 0).getTime()
    const db = new Date(b.created || 0).getTime()
    return sortNewest ? db - da : da - db
  })

  const inputClass = 'w-full px-3 py-2.5 bg-dark-700 border border-dark-500 text-white rounded-lg focus:border-gold-500 focus:outline-none text-sm'
  const labelClass = 'text-xs text-gray-500 uppercase tracking-widest block mb-1.5'

  return (
    <div className="space-y-8">
      <SectionTitle>Facturen</SectionTitle>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Totaal facturen" value={facturen.length} />
        <StatCard label="Deze maand" value={facturen.filter(f => f.created && new Date(f.created) >= startOf('month')).length} />
      </div>

      {/* Generate form */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl p-4 sm:p-6 space-y-5 sm:space-y-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Nieuwe factuur</h3>

        {/* Car selector */}
        <label className="block">
          <span className={labelClass}>Selecteer voertuig</span>
          <select
            value={selectedCarId}
            onChange={e => setSelectedCarId(e.target.value)}
            className={inputClass}
          >
            <option value="">— Kies een wagen —</option>
            {cars.map(car => (
              <option key={car.id} value={car.id}>
                {car.title} — €{car.price.toLocaleString('nl-BE')}
              </option>
            ))}
          </select>
        </label>

        {selectedCar && (
          <div className="bg-dark-700/50 border border-dark-500 rounded-lg p-4">
            <p className="text-gold-500 text-xs uppercase tracking-widest mb-1">{selectedCar.brand}</p>
            <p className="text-white font-medium text-sm">{selectedCar.title}</p>
            <p className="text-gray-400 text-xs mt-1">
              {selectedCar.year > 0 && `${selectedCar.year} · `}
              {selectedCar.mileage > 0 && `${selectedCar.mileage.toLocaleString('nl-BE')} km · `}
              €{selectedCar.price.toLocaleString('nl-BE')}
            </p>
          </div>
        )}

        {/* Klant info */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Klantgegevens</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className={labelClass}>Naam *</span>
              <input type="text" placeholder="Naam klant" value={klantNaam} onChange={e => setKlantNaam(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Adres</span>
              <input type="text" placeholder="Straat + nr, postcode stad" value={klantAdres} onChange={e => setKlantAdres(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>BTW-nummer</span>
              <input type="text" placeholder="BE0123.456.789" value={klantBtw} onChange={e => setKlantBtw(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Chassisnummer</span>
              <input type="text" placeholder="VIN / chassisnummer" value={chassisnummer} onChange={e => setChassisnummer(e.target.value)} className={inputClass} />
            </label>
            <label className="block md:col-span-2">
              <span className={labelClass}>E-mailadres — de factuur wordt naar dit adres verstuurd</span>
              <input type="email" placeholder="klant@voorbeeld.be" value={klantEmail} onChange={e => setKlantEmail(e.target.value)} className={inputClass} />
            </label>
          </div>
        </div>

        {/* Price */}
        <label className="block">
          <span className={labelClass}>Prijs (€)</span>
          <input
            type="number"
            placeholder="Prijs"
            value={customPrijs}
            onChange={e => setCustomPrijs(e.target.value)}
            className={inputClass}
          />
          {selectedCar && customPrijs !== String(selectedCar.price) && (
            <p className="text-xs text-gray-500 mt-1">Oorspronkelijke prijs: €{selectedCar.price.toLocaleString('nl-BE')}</p>
          )}
        </label>

        {/* Extra instructions */}
        <label className="block">
          <span className={labelClass}>Extra instructies</span>
          <textarea
            placeholder="Bijv. extra kosten, korting, opmerkingen, specifieke wensen voor de factuur..."
            value={extra}
            onChange={e => setExtra(e.target.value)}
            rows={3}
            className={`${inputClass} resize-y`}
          />
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-emerald-400 text-sm">{success}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading || !selectedCarId || !klantNaam.trim()}
          className="w-full py-3 bg-gold-500 text-dark-900 font-bold uppercase tracking-wider rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Factuur genereren...' : 'Factuur genereren'}
        </button>
      </div>

      {/* Invoice list */}
      <div className="bg-dark-800 border border-dark-500 rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-dark-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Alle facturen ({facturen.length})
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSortNewest(s => !s)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold-500 transition-colors px-2 py-1 rounded hover:bg-gold-500/10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-transform ${sortNewest ? '' : 'rotate-180'}`}>
                <path d="M12 5v14M5 12l7-7 7 7" />
              </svg>
              {sortNewest ? 'Nieuwste eerst' : 'Oudste eerst'}
            </button>
            <button
              onClick={loadFacturen}
              disabled={facturenLoading}
              className="text-xs text-gray-500 hover:text-gold-500 transition-colors px-2 py-1 rounded hover:bg-gold-500/10"
            >
              {facturenLoading ? 'Laden...' : 'Vernieuwen'}
            </button>
          </div>
        </div>

        {sortedFacturen.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-10">Nog geen facturen.</p>
        ) : (
          <div className="divide-y divide-dark-600">
            {sortedFacturen.map((f, i) => {
              const parts = f.filename.replace('.docx', '').split('_')
              const nummer = parts[1] || ''
              const rest = parts.slice(2).join(' ')

              const isSent = f.status === 'sent'
              const isSending = sending === f.filename
              const showEmailInput = sendingFor === f.filename

              return (
                <div key={i} className="px-4 sm:px-6 py-4 hover:bg-dark-700/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                        <span className="text-gold-500 font-mono text-sm font-medium">{nummer}</span>
                        <span className="text-white text-sm truncate">{rest}</span>
                        {isSent ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-emerald-500/20">
                            Verzonden
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-500/10 text-gray-500 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-gray-500/20">
                            Niet verzonden
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {f.created ? new Date(f.created).toLocaleString('nl-BE', {
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : '—'}
                        {isSent && f.sentTo && (
                          <span className="ml-2 text-emerald-500/70">→ {f.sentTo}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={getDownloadUrl(f)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gold-500/10 text-gold-500 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-gold-500/20 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        <span className="hidden sm:inline">Download</span>
                      </a>
                      {!isSent && (
                        <button
                          onClick={() => setSendingFor(showEmailInput ? null : f.filename)}
                          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-emerald-500/20 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                          </svg>
                          <span className="hidden sm:inline">Verzenden</span>
                        </button>
                      )}
                    </div>
                  </div>
                  {showEmailInput && !isSent && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="email"
                        placeholder="E-mailadres van de klant"
                        value={sendEmailInput[f.filename] || ''}
                        onChange={e => setSendEmailInput(prev => ({ ...prev, [f.filename]: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-dark-700 border border-dark-500 text-white rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                      />
                      <button
                        onClick={async () => {
                          const email = sendEmailInput[f.filename]?.trim()
                          if (!email) return
                          const klantNaam = rest.split(' ').slice(0, -2).join(' ') || 'Klant'
                          const ok = await sendFactuur(f.filename, email, klantNaam)
                          if (ok) {
                            setSendingFor(null)
                            setSendEmailInput(prev => { const n = { ...prev }; delete n[f.filename]; return n })
                          }
                        }}
                        disabled={isSending || !sendEmailInput[f.filename]?.trim()}
                        className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                      >
                        {isSending ? 'Verzenden...' : 'Verstuur'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
