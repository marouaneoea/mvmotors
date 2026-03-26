export interface Car {
  id: string
  brand: string
  model: string
  title: string
  year: number
  mileage: number
  fuel: string
  transmission: string
  power: string
  price: number
  priceAllIn: number | null
  euroNorm: string | null
  firstOwner: boolean
  warranty: string | null
  features: string[]
  image: string
  images?: string[]
  url: string
  type?: string
  reserved?: boolean
  lastUpdated?: string
  dateAdded?: string
}
