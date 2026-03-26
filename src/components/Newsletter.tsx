import { useState } from 'react'
import type { FormEvent } from 'react'
import { subscribeEmail } from '../lib/supabase'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Vul een geldig e-mailadres in')
      return
    }

    setStatus('loading')
    
    const result = await subscribeEmail(email)
    
    if (result.success) {
      setStatus('success')
      setMessage('Bedankt! U ontvangt bericht bij nieuwe wagens.')
      setEmail('')
    } else {
      setStatus('error')
      setMessage(result.error || 'Er ging iets mis. Probeer opnieuw.')
    }
  }

  return (
    <section className="py-16 bg-gradient-to-b from-dark-800 to-dark-900">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="bg-dark-700 border border-dark-500 rounded-xl p-8 md:p-12">
          <span className="text-4xl mb-4 block">🔔</span>
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Blijf op de hoogte
          </h3>
          <p className="text-gray-400 mb-8">
            Ontvang als eerste bericht wanneer we nieuwe wagens toevoegen aan ons aanbod.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Uw e-mailadres"
              disabled={status === 'loading' || status === 'success'}
              className="flex-1 px-5 py-4 bg-dark-800 border border-dark-500 text-white rounded-lg placeholder-gray-500 focus:border-gold-500 focus:outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-8 py-4 bg-gold-500 text-dark-800 font-bold uppercase tracking-wider rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Even geduld...' : status === 'success' ? '✓ Ingeschreven' : 'Inschrijven'}
            </button>
          </form>
          
          {message && (
            <p className={`mt-4 text-sm ${status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
          
          <p className="mt-6 text-xs text-gray-600">
            🔒 Uw gegevens worden veilig opgeslagen en nooit gedeeld met derden.
          </p>
        </div>
      </div>
    </section>
  )
}
