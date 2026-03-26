import { useState, useMemo } from 'react'
import { useCars } from '../hooks/useCars'
import { CarCard } from './CarCard'
import { Filters } from './Filters'

export function CarListing() {
  const { cars, loading } = useCars()
  const [selectedBrand, setSelectedBrand] = useState('')
  const [sortBy, setSortBy] = useState('price-asc')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  const brands = useMemo(() => {
    return [...new Set(cars.map(c => c.brand))].sort()
  }, [cars])

  const filteredCars = useMemo(() => {
    let result = [...cars]

    if (selectedBrand) result = result.filter(c => c.brand === selectedBrand)
    if (showAvailableOnly) result = result.filter(c => !c.reserved)

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break
      case 'price-desc': result.sort((a, b) => b.price - a.price); break
      case 'year-desc': result.sort((a, b) => b.year - a.year); break
      case 'mileage-asc': result.sort((a, b) => a.mileage - b.mileage); break
      case 'date-desc': result.sort((a, b) => (b.dateAdded ?? '').localeCompare(a.dateAdded ?? '')); break
      case 'date-asc':  result.sort((a, b) => (a.dateAdded ?? '').localeCompare(b.dateAdded ?? '')); break
    }

    return result
  }, [cars, selectedBrand, sortBy, showAvailableOnly])

  return (
    <section id="voertuigen" className="py-24 bg-dark-800">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-3">Ons Aanbod</h2>
        <p className="text-center text-gray-500 mb-12">
          {loading ? 'Laden...' : `${filteredCars.length} ${showAvailableOnly ? 'beschikbare' : ''} voertuigen`}
          {!loading && filteredCars.length !== cars.length && ` (${cars.length} totaal)`}
        </p>

        <Filters
          brands={brands}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showAvailableOnly={showAvailableOnly}
          setShowAvailableOnly={setShowAvailableOnly}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCars.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        {!loading && filteredCars.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p>Geen voertuigen gevonden met deze filters.</p>
          </div>
        )}
      </div>
    </section>
  )
}
