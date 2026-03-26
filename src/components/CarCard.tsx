import { Link } from 'react-router-dom'
import type { Car } from '../types'

interface CarCardProps {
  car: Car
}

export function CarCard({ car }: CarCardProps) {
  const isReserved = car.reserved || false

  const handleClick = () => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/car_clicks`
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    const body = JSON.stringify({ car_id: car.id, car_title: car.title, brand: car.brand })
    const headers = { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` }
    // Use keepalive so the request survives page navigation
    fetch(url, { method: 'POST', headers, body, keepalive: true }).catch(() => {})
  }

  return (
    <Link
      to={`/cars/${car.id}`}
      onClick={handleClick}
      className={`group bg-dark-700 rounded-lg overflow-hidden border border-dark-500 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-black/50 hover:bg-dark-600 ${isReserved ? 'opacity-60' : ''}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={car.image} 
          alt={car.title} 
          loading="lazy"
          className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${isReserved ? 'grayscale' : ''}`}
        />
        {/* Reserved overlay */}
        {isReserved && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="px-6 py-3 bg-red-600 text-white text-lg font-bold uppercase tracking-wider transform -rotate-12 shadow-lg">
              Gereserveerd
            </span>
          </div>
        )}
        {car.firstOwner && !isReserved && (
          <span className="absolute top-3 left-3 px-3 py-1.5 bg-gold-500 text-dark-800 text-[10px] font-bold uppercase tracking-wider rounded-sm">
            1ste eigenaar
          </span>
        )}
        {car.warranty && !isReserved && (
          <span className="absolute top-3 right-3 px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">
            Garantie
          </span>
        )}
      </div>
      <div className="p-6">
        <div className="text-gold-500 text-xs uppercase tracking-[0.2em] font-semibold mb-1">
          {car.brand}
        </div>
        <h3 className="text-lg font-semibold mb-4 leading-tight">
          {car.title}
        </h3>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">📅 {car.year}</span>
          <span className="flex items-center gap-1.5">🛣️ {car.mileage.toLocaleString('nl-BE')} km</span>
          <span className="flex items-center gap-1.5">⛽ {car.fuel}</span>
          <span className="flex items-center gap-1.5">⚙️ {car.transmission}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          {car.features.slice(0, 3).map((f, i) => (
            <span key={i} className="px-2.5 py-1 bg-gold-500/10 text-gold-400 text-[10px] uppercase tracking-wide rounded-full">
              {f}
            </span>
          ))}
          {car.features.length > 3 && (
            <span className="px-2.5 py-1 bg-dark-500 text-gray-500 text-[10px] uppercase rounded-full">
              +{car.features.length - 3}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-4 pt-4 border-t border-dark-500">
          <span className="text-2xl font-bold text-gold-500">
            €{car.price.toLocaleString('nl-BE')}
          </span>
          {car.priceAllIn && (
            <span className="text-sm text-gray-500">
              All-in: €{car.priceAllIn.toLocaleString('nl-BE')}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
