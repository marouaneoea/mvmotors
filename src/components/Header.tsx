import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session)
    })
    const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session)
    }) ?? { data: null }
    return () => { listener?.subscription.unsubscribe() }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = async () => {
    await supabase?.auth.signOut()
    setLoggedIn(false)
    closeMenu()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-800/95 backdrop-blur-xl border-b border-dark-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <button onClick={scrollToTop} className="flex items-baseline gap-1.5 text-xl sm:text-2xl font-extrabold hover:opacity-80 transition-opacity">
          <span className="text-gold-500">MV</span>
          <span className="font-light tracking-[0.25em] text-lg sm:text-xl">MOTORS</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-10">
          <a href="#voertuigen" className="text-gray-300 text-sm font-medium tracking-wider uppercase hover:text-gold-500 transition-colors">
            Voertuigen
          </a>
          <a href="#over-ons" className="text-gray-300 text-sm font-medium tracking-wider uppercase hover:text-gold-500 transition-colors">
            Over Ons
          </a>
          <a href="#contact" className="text-gray-300 text-sm font-medium tracking-wider uppercase hover:text-gold-500 transition-colors">
            Contact
          </a>
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-5">
          <a href="tel:+32485737845" className="text-gold-500 font-semibold text-lg">
            📞 0485 73 78 45
          </a>
          {loggedIn && (
            <>
              <a
                href="/admin"
                className="text-xs font-semibold uppercase tracking-wider text-gold-500 hover:text-gold-400 transition-colors px-3 py-1.5 border border-gold-500/30 rounded-lg hover:bg-gold-500/10"
              >
                Dashboard
              </a>
              <button
                onClick={handleLogout}
                className="text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-red-400 transition-colors"
              >
                Uitloggen
              </button>
            </>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-3">
          <a href="tel:+32485737845" className="text-gold-500 font-semibold text-sm">
            📞 0485&nbsp;73&nbsp;78&nbsp;45
          </a>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 text-gray-300 hover:text-white transition-colors"
            aria-label="Menu"
          >
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-500 px-4 py-4 flex flex-col gap-4">
          <a href="#voertuigen" onClick={closeMenu} className="text-gray-300 text-sm font-medium tracking-wider uppercase hover:text-gold-500 transition-colors py-2">
            Voertuigen
          </a>
          <a href="#over-ons" onClick={closeMenu} className="text-gray-300 text-sm font-medium tracking-wider uppercase hover:text-gold-500 transition-colors py-2">
            Over Ons
          </a>
          <a href="#contact" onClick={closeMenu} className="text-gray-300 text-sm font-medium tracking-wider uppercase hover:text-gold-500 transition-colors py-2">
            Contact
          </a>
          {loggedIn && (
            <>
              <a href="/admin" onClick={closeMenu} className="text-gold-500 text-sm font-semibold tracking-wider uppercase py-2">
                Dashboard
              </a>
              <button onClick={handleLogout} className="text-left text-gray-500 text-sm font-medium tracking-wider uppercase hover:text-red-400 transition-colors py-2">
                Uitloggen
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
