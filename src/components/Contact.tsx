export function Contact() {
  return (
    <section id="contact" className="py-24 bg-dark-800">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Contact</h2>
        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="flex gap-5">
              <span className="text-4xl">📍</span>
              <div>
                <strong className="text-gold-500 text-sm uppercase tracking-wider block mb-1">Locatie</strong>
                <p className="text-gray-300">Mechelen, België</p>
              </div>
            </div>
            <div className="flex gap-5">
              <span className="text-4xl">📞</span>
              <div>
                <strong className="text-gold-500 text-sm uppercase tracking-wider block mb-1">Telefoon</strong>
                <p className="text-gray-300">
                  <a href="tel:+32485737845" className="hover:text-white transition-colors">0485 73 78 45</a><br/>
                  <a href="tel:+32497663800" className="hover:text-white transition-colors">0497 66 38 00</a>
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <span className="text-4xl">💬</span>
              <div>
                <strong className="text-gold-500 text-sm uppercase tracking-wider block mb-1">WhatsApp / SMS</strong>
                <p className="text-gray-300">Bel, SMS of app ons vrijblijvend!</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-gray-500 text-sm uppercase tracking-widest mb-5">Volg ons</h3>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://www.2dehands.be/u/mv-motors/35556286/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 px-8 py-4 bg-dark-700 border border-dark-500 rounded font-medium hover:border-gold-500 hover:bg-gold-500/10 transition-all"
              >
                🛒 2dehands
              </a>
              <a 
                href="https://wa.me/32485737845" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 px-8 py-4 bg-dark-700 border border-dark-500 rounded font-medium hover:border-emerald-500 hover:bg-emerald-500/10 transition-all"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
