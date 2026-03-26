import { useState } from 'react'

const API = 'https://factuur.mvmotors.be'
const API_KEY = import.meta.env.VITE_FACTUUR_API_KEY || ''

export interface FactuurInput {
  klant: {
    naam: string
    adres?: string
    btw?: string
    email?: string
  }
  auto: {
    merk: string
    model: string
    chassisnummer?: string
    bouwjaar?: number
    kilometerstand?: number
  }
  prijs: number
  extra?: string
}

export interface FactuurFile {
  filename: string
  downloadUrl: string
  created: string
  status: 'sent' | 'unsent'
  sentAt: string | null
  sentTo: string | null
}

export function useFactuur() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facturen, setFacturen] = useState<FactuurFile[]>([])
  const [facturenLoading, setFacturenLoading] = useState(false)
  const [sending, setSending] = useState<string | null>(null)

  async function generateFactuur(input: FactuurInput): Promise<boolean> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/factuur`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      // API returns the .docx file directly — trigger download
      const blob = await res.blob()
      const nummer = res.headers.get('X-Factuur-Nummer') || 'factuur'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${nummer}.docx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      return true
    } catch (e: any) {
      setError(e.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  async function loadFacturen() {
    setFacturenLoading(true)
    try {
      const res = await fetch(`${API}/facturen`, { headers: { 'X-API-Key': API_KEY } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const list: FactuurFile[] = data.facturen || data || []
      setFacturen(list)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setFacturenLoading(false)
    }
  }

  async function sendFactuur(filename: string, email: string, klantNaam: string): Promise<boolean> {
    setSending(filename)
    setError(null)
    try {
      const res = await fetch(`${API}/factuur/${encodeURIComponent(filename)}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: JSON.stringify({ email, klantNaam }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      // Update local state
      setFacturen(prev => prev.map(f =>
        f.filename === filename
          ? { ...f, status: 'sent' as const, sentAt: new Date().toISOString(), sentTo: email }
          : f
      ))
      return true
    } catch (e: any) {
      setError(e.message)
      return false
    } finally {
      setSending(null)
    }
  }

  function getDownloadUrl(f: FactuurFile) {
    return `${API}${f.downloadUrl}?apiKey=${API_KEY}`
  }

  return { generateFactuur, loading, error, facturen, facturenLoading, loadFacturen, getDownloadUrl, sendFactuur, sending }
}
