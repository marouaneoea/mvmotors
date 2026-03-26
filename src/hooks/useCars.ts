import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { normalizeBrand } from '../lib/brands'
import type { Car } from '../types'

const REFRESH_INTERVAL = 30 * 1000 // 30 seconds

export function useCars() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCars = async () => {
      if (!supabase) {
        setError('Database not configured')
        setLoading(false)
        return
      }

      try {
        const { data, error: dbError } = await supabase
          .from('cars')
          .select('*')
          .order('price', { ascending: true })

        if (dbError) throw dbError

        const mapped: Car[] = (data ?? []).map(row => ({
          id: row.id,
          brand: normalizeBrand(row.brand),
          model: row.model,
          title: row.title,
          year: row.year,
          mileage: row.mileage,
          fuel: row.fuel,
          transmission: row.transmission,
          power: row.power,
          price: row.price,
          priceAllIn: row.price_all_in,
          euroNorm: row.euro_norm,
          firstOwner: row.first_owner,
          warranty: row.warranty,
          features: row.features ?? [],
          image: row.image,
          url: row.url,
          reserved: row.reserved,
          lastUpdated: row.last_updated,
          dateAdded: row.date_added,
        }))

        setCars(mapped)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch cars:', err)
        setError('Kon voertuigen niet laden')
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
    const interval = setInterval(fetchCars, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  return { cars, loading, error }
}
