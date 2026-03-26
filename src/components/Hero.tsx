export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-dark-800" />
      <div className="relative text-center px-6 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-4">
          <span className="text-gold-500">MV</span> Motors
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 font-light tracking-widest mb-10">
          Kwaliteitsvoertuigen met garantie in Mechelen
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-10 mb-12">
          <div className="flex items-center justify-center gap-2 text-white">
            <span className="text-gold-500">✓</span> Car-Pass
          </div>
          <div className="flex items-center justify-center gap-2 text-white">
            <span className="text-gold-500">✓</span> 12 maanden garantie
          </div>
          <div className="flex items-center justify-center gap-2 text-white">
            <span className="text-gold-500">✓</span> Keuring inbegrepen
          </div>
        </div>
        <a href="#voertuigen" className="btn-primary">
          Bekijk ons aanbod
        </a>
      </div>
    </section>
  )
}
