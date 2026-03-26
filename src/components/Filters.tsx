interface FiltersProps {
  brands: string[]
  selectedBrand: string
  setSelectedBrand: (b: string) => void
  sortBy: string
  setSortBy: (s: string) => void
  showAvailableOnly: boolean
  setShowAvailableOnly: (v: boolean) => void
}

export function Filters({ 
  brands, 
  selectedBrand, 
  setSelectedBrand,
  sortBy,
  setSortBy,
  showAvailableOnly,
  setShowAvailableOnly
}: FiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-stretch sm:items-end mb-12">
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wider text-gray-500">Merk</label>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="w-full sm:min-w-[200px] px-4 sm:px-5 py-3 bg-dark-700 border border-dark-500 text-white rounded cursor-pointer hover:border-gold-500 focus:border-gold-500 focus:outline-none transition-colors"
        >
          <option value="">Alle merken</option>
          {brands.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wider text-gray-500">Sorteer op</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full sm:min-w-[200px] px-4 sm:px-5 py-3 bg-dark-700 border border-dark-500 text-white rounded cursor-pointer hover:border-gold-500 focus:border-gold-500 focus:outline-none transition-colors"
        >
          <option value="price-asc">Prijs (laag → hoog)</option>
          <option value="price-desc">Prijs (hoog → laag)</option>
          <option value="year-desc">Bouwjaar (nieuwste)</option>
          <option value="mileage-asc">Kilometerstand (laagste)</option>
          <option value="date-desc">Datum (nieuwste eerst)</option>
          <option value="date-asc">Datum (oudste eerst)</option>
        </select>
      </div>
      <label className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-dark-700 border border-dark-500 rounded cursor-pointer hover:border-gold-500 transition-colors select-none">
        <input
          type="checkbox"
          checked={showAvailableOnly}
          onChange={(e) => setShowAvailableOnly(e.target.checked)}
          className="w-5 h-5 rounded border-dark-500 bg-dark-800 text-gold-500 focus:ring-gold-500 focus:ring-offset-0 cursor-pointer"
        />
        <span className="text-white text-sm">Beschikbare auto's</span>
      </label>
    </div>
  )
}
