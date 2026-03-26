export function About() {
  const features = [
    'Alle voertuigen gekeurd voor verkoop',
    'Car-Pass met gewaarborgde kilometerstand',
    '12 maanden garantie op geselecteerde wagens',
    'Overname van uw huidige wagen mogelijk',
    'Meertalige service: NL / FR / EN'
  ]

  return (
    <section id="over-ons" className="py-24 bg-dark-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4">Over MV Motors</h2>
        <div className="grid md:grid-cols-2 gap-16 items-center mt-12">
          <div>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              MV Motors is uw betrouwbare partner voor kwaliteitsvolle tweedehandswagens in Mechelen. 
              Wij selecteren zorgvuldig elk voertuig en bieden u de zekerheid van een grondige keuring 
              en transparante Car-Pass.
            </p>
            <ul className="space-y-4">
              {features.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white border-b border-dark-500 pb-4">
                  <span className="text-gold-500">✅</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80" 
              alt="MV Motors" 
              className="w-full rounded-lg shadow-2xl shadow-black/50"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
