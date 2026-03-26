export function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-500 py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex items-baseline justify-center gap-1.5 text-2xl font-extrabold mb-4">
          <span className="text-gold-500">MV</span>
          <span className="font-light tracking-[0.25em] text-xl">MOTORS</span>
        </div>
        <p className="text-gray-500 mb-6">Kwaliteitsvoertuigen in Mechelen</p>
        <div className="flex justify-center gap-4 text-gray-400 mb-10">
          <a href="https://www.2dehands.be/u/mv-motors/35556286/" target="_blank" rel="noopener noreferrer" className="hover:text-gold-500 transition-colors">
            2dehands
          </a>
          <span className="text-dark-500">•</span>
          <a href="tel:+32485737845" className="hover:text-gold-500 transition-colors">0485 73 78 45</a>
        </div>
        <div className="pt-8 border-t border-dark-500">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} MV Motors. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  )
}
