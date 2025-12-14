import { useState, useEffect, useCallback, useRef } from 'react'
import contentstackApi from '../services/contentstack'
import { trackSearch, trackFilter, trackClick, trackSectorInterest, trackMarketCapInterest, trackRiskAppetite } from '../services/lytics'
import StockCard from '../components/StockCard'
import Input from '../components/Input'
import Button from '../components/Button'

const Stocks = () => {
  const [stocks, setStocks] = useState([])
  const [filteredStocks, setFilteredStocks] = useState([])
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('all')
  const [selectedMarketCap, setSelectedMarketCap] = useState('all')
  const [selectedRisk, setSelectedRisk] = useState('all')
  const searchTimeoutRef = useRef(null)

  // Debounced search tracking
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    if (searchTerm && searchTerm.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        trackSearch(searchTerm, filteredStocks.length)
      }, 1000) // Track after 1 second of no typing
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, filteredStocks.length])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksData, sectorsData] = await Promise.all([
          contentstackApi.getAllStocks({ limit: 100 }),
          contentstackApi.getAllSectors()
        ])
        setStocks(stocksData.stocks)
        setFilteredStocks(stocksData.stocks)
        setSectors(sectorsData)
      } catch (error) {
        console.error('Failed to fetch stocks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let result = stocks

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        stock =>
          stock.symbol?.toLowerCase().includes(term) ||
          stock.title?.toLowerCase().includes(term)
      )
    }

    // Sector filter
    if (selectedSector !== 'all') {
      result = result.filter(stock => stock.sector_name === selectedSector)
    }

    // Market cap filter
    if (selectedMarketCap !== 'all') {
      result = result.filter(stock => stock.market_cap === selectedMarketCap)
    }

    // Risk filter
    if (selectedRisk !== 'all') {
      result = result.filter(stock => stock.risk_level === selectedRisk)
    }

    setFilteredStocks(result)
  }, [searchTerm, selectedSector, selectedMarketCap, selectedRisk, stocks])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedSector('all')
    setSelectedMarketCap('all')
    setSelectedRisk('all')
    trackClick('clear_filters', { had_search: !!searchTerm })
  }

  const hasFilters = searchTerm || selectedSector !== 'all' || selectedMarketCap !== 'all' || selectedRisk !== 'all'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            Explore Stocks
          </h1>
          <p className="text-dark-muted">
            Discover and trade from our collection of {stocks.length} Indian stocks
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl p-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-tertiary border border-dark-border rounded-lg text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                />
              </div>
            </div>

            {/* Sector Filter */}
            <select
              value={selectedSector}
              onChange={(e) => {
                const value = e.target.value
                setSelectedSector(value)
                if (value !== 'all') {
                  trackFilter('sector', value)
                  trackSectorInterest(value, 'filter')
                }
              }}
              className="px-4 py-3 bg-dark-tertiary border border-dark-border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
            >
              <option value="all">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector.uid} value={sector.title}>{sector.title}</option>
              ))}
            </select>

            {/* Market Cap Filter */}
            <select
              value={selectedMarketCap}
              onChange={(e) => {
                const value = e.target.value
                setSelectedMarketCap(value)
                if (value !== 'all') {
                  trackFilter('market_cap', value)
                  trackMarketCapInterest(value, 'filter')
                }
              }}
              className="px-4 py-3 bg-dark-tertiary border border-dark-border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
            >
              <option value="all">All Market Caps</option>
              <option value="Large Cap">Large Cap</option>
              <option value="Mid Cap">Mid Cap</option>
              <option value="Small Cap">Small Cap</option>
            </select>

            {/* Risk Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => {
                const value = e.target.value
                setSelectedRisk(value)
                if (value !== 'all') {
                  trackFilter('risk_level', value)
                  trackRiskAppetite(value, 'filter')
                }
              }}
              className="px-4 py-3 bg-dark-tertiary border border-dark-border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
            >
              <option value="all">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

          {/* Active Filters */}
          {hasFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dark-border">
              <span className="text-sm text-dark-muted">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary text-xs rounded-md flex items-center gap-1">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="hover:text-white">×</button>
                  </span>
                )}
                {selectedSector !== 'all' && (
                  <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary text-xs rounded-md flex items-center gap-1">
                    {selectedSector}
                    <button onClick={() => setSelectedSector('all')} className="hover:text-white">×</button>
                  </span>
                )}
                {selectedMarketCap !== 'all' && (
                  <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary text-xs rounded-md flex items-center gap-1">
                    {selectedMarketCap}
                    <button onClick={() => setSelectedMarketCap('all')} className="hover:text-white">×</button>
                  </span>
                )}
                {selectedRisk !== 'all' && (
                  <span className="px-2 py-1 bg-accent-primary/10 text-accent-primary text-xs rounded-md flex items-center gap-1">
                    {selectedRisk}
                    <button onClick={() => setSelectedRisk('all')} className="hover:text-white">×</button>
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-accent-danger hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-dark-muted">
            Showing <span className="text-white font-medium">{filteredStocks.length}</span> of {stocks.length} stocks
          </p>
        </div>

        {/* Stock Grid */}
        {filteredStocks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStocks.map(stock => (
              <StockCard key={stock.uid} stock={stock} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No stocks found</h3>
            <p className="text-dark-muted mb-4">Try adjusting your search or filters</p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Stocks


