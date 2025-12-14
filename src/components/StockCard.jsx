import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { stockApi } from '../services/api'
import contentstackApi from '../services/contentstack'

const StockCard = ({ stock, showPrice = true }) => {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (showPrice && stock?.symbol) {
      const fetchPrice = async () => {
        try {
          const data = await stockApi.getPrice(stock.symbol)
          setPriceData(data.data)
        } catch (error) {
          console.error('Failed to fetch price:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchPrice()
    } else {
      setLoading(false)
    }
  }, [stock?.symbol, showPrice])

  if (!stock) return null

  const logoUrl = stock.logo?.[0]?.url || contentstackApi.getAssetUrl(stock.logo)
  
  // Random mock change percentage for demo
  const changePercent = ((Math.random() - 0.5) * 10).toFixed(2)
  const isPositive = parseFloat(changePercent) >= 0

  return (
    <Link
      to={`/stock/${stock.symbol}`}
      className="glass-card rounded-xl p-5 hover-lift group block"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={stock.title}
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-dark-tertiary rounded-xl flex items-center justify-center">
              <span className="font-mono font-bold text-sm text-dark-muted">
                {stock.symbol?.substring(0, 2)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white group-hover:text-accent-primary transition-colors">
              {stock.symbol}
            </h3>
            <p className="text-xs text-dark-muted truncate max-w-[120px]">
              {stock.title}
            </p>
          </div>
        </div>
        
        {/* Sector Badge */}
        {stock.sector_name && (
          <span className="px-2 py-1 bg-dark-tertiary text-dark-muted text-xs rounded-md">
            {stock.sector_name}
          </span>
        )}
      </div>

      {showPrice && (
        <div className="flex items-end justify-between">
          <div>
            {loading ? (
              <div className="h-8 w-24 bg-dark-tertiary rounded animate-pulse"></div>
            ) : (
              <p className="text-2xl font-display font-bold text-white">
                ₹{priceData?.price?.toLocaleString('en-IN') || '—'}
              </p>
            )}
          </div>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-accent-success' : 'text-accent-danger'}`}>
            <svg className={`w-4 h-4 ${isPositive ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-sm font-medium">{isPositive ? '+' : ''}{changePercent}%</span>
          </div>
        </div>
      )}

      {/* Market Cap and Risk */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-dark-border">
        {stock.market_cap && (
          <span className="text-xs text-dark-muted">
            <span className="text-dark-text">Cap:</span> {stock.market_cap}
          </span>
        )}
        {stock.risk_level && (
          <span className={`text-xs ${
            stock.risk_level === 'High' ? 'text-accent-danger' :
            stock.risk_level === 'Medium' ? 'text-accent-warning' :
            'text-accent-success'
          }`}>
            {stock.risk_level} Risk
          </span>
        )}
      </div>
    </Link>
  )
}

export default StockCard


