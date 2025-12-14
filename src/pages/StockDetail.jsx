import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import contentstackApi from '../services/contentstack'
import { stockApi, tradingApi, userApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { trackStockView, trackStockTransaction, trackClick, trackSectorInterest, trackMarketCapInterest, trackRiskAppetite } from '../services/lytics'
import Button from '../components/Button'
import Input from '../components/Input'

const StockDetail = () => {
  const { symbol } = useParams()
  const { isAuthenticated, user, refreshUser } = useAuth()
  const [stock, setStock] = useState(null)
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tradeType, setTradeType] = useState('buy')
  const [quantity, setQuantity] = useState('')
  const [trading, setTrading] = useState(false)
  const [tradeMessage, setTradeMessage] = useState({ type: '', text: '' })
  const [userHolding, setUserHolding] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Track view if authenticated (don't wait for it)
        if (isAuthenticated) {
          userApi.trackStock(symbol).catch(err => {
            console.log('Could not track stock view:', err.message)
          })
        }

        const [stockData, priceResponse] = await Promise.all([
          contentstackApi.getStock(symbol),
          stockApi.getPrice(symbol)
        ])

        setStock(stockData)
        setPriceData(priceResponse.data)

        // Track stock view with Lytics
        if (stockData) {
          trackStockView(stockData)
          // Track additional preferences for segmentation
          if (stockData.market_cap) {
            trackMarketCapInterest(stockData.market_cap, 'view')
          }
          if (stockData.risk_level) {
            trackRiskAppetite(stockData.risk_level, 'view')
          }
        }

        // Get user holdings for this stock
        if (isAuthenticated) {
          try {
            const holdings = await tradingApi.getHoldings()
            const holdingsArray = holdings.data?.holdings || []
            const holding = holdingsArray.find(h => h.symbol === symbol.toUpperCase())
            setUserHolding(holding || null)
          } catch (holdingsError) {
            console.log('Could not fetch holdings:', holdingsError)
          }
        }
      } catch (error) {
        console.error('Failed to fetch stock data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [symbol, isAuthenticated])

  const handleTrade = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      setTradeMessage({ type: 'error', text: 'Please enter a valid quantity' })
      return
    }

    setTrading(true)
    setTradeMessage({ type: '', text: '' })

    try {
      const qty = parseInt(quantity)
      const price = priceData?.price || 0
      const total = price * qty

      const sector = stock.sector_name || stock.sector?.[0]?.title

      if (tradeType === 'buy') {
        await tradingApi.buy(symbol, qty)
        setTradeMessage({ type: 'success', text: `Successfully bought ${quantity} shares of ${symbol}` })
        // Track buy transaction with Lytics
        trackStockTransaction('buy', stock, qty, price, total)
        // Track sector interest from purchase
        if (sector) trackSectorInterest(sector, 'buy')
        if (stock.market_cap) trackMarketCapInterest(stock.market_cap, 'buy')
        if (stock.risk_level) trackRiskAppetite(stock.risk_level, 'buy')
      } else {
        await tradingApi.sell(symbol, qty)
        setTradeMessage({ type: 'success', text: `Successfully sold ${quantity} shares of ${symbol}` })
        // Track sell transaction with Lytics
        trackStockTransaction('sell', stock, qty, price, total)
        // Track sector interest from sale
        if (sector) trackSectorInterest(sector, 'sell')
      }
      
      // Refresh user data and holdings
      await refreshUser()
      try {
        const holdings = await tradingApi.getHoldings()
        const holdingsArray = holdings.data?.holdings || []
        const holding = holdingsArray.find(h => h.symbol === symbol.toUpperCase())
        setUserHolding(holding || null)
      } catch (err) {
        console.log('Could not refresh holdings:', err)
      }
      setQuantity('')
    } catch (error) {
      setTradeMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Transaction failed' 
      })
    } finally {
      setTrading(false)
    }
  }

  const totalCost = priceData?.price && quantity 
    ? (priceData.price * parseInt(quantity || 0)).toFixed(2)
    : 0

  // Random change for demo
  const changePercent = ((Math.random() - 0.5) * 10).toFixed(2)
  const isPositive = parseFloat(changePercent) >= 0
  const changeAmount = priceData?.price 
    ? ((priceData.price * parseFloat(changePercent)) / 100).toFixed(2)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">Stock not found</h1>
        <Link to="/stocks">
          <Button>Browse Stocks</Button>
        </Link>
      </div>
    )
  }

  const logoUrl = stock.logo?.[0]?.url || contentstackApi.getAssetUrl(stock.logo)

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-dark-muted mb-8">
          <Link to="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link to="/stocks" className="hover:text-white">Stocks</Link>
          <span>/</span>
          <span className="text-white">{symbol}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stock Header */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={stock.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-dark-tertiary rounded-xl flex items-center justify-center">
                      <span className="font-mono font-bold text-lg text-dark-muted">
                        {symbol.substring(0, 2)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h1 className="font-display text-2xl font-bold text-white">{symbol}</h1>
                    <p className="text-dark-muted">{stock.title}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {stock.market_cap && (
                    <span className="px-3 py-1 bg-dark-tertiary text-dark-text text-sm rounded-lg">
                      {stock.market_cap}
                    </span>
                  )}
                  {stock.risk_level && (
                    <span className={`px-3 py-1 text-sm rounded-lg ${
                      stock.risk_level === 'High' ? 'bg-accent-danger/10 text-accent-danger' :
                      stock.risk_level === 'Medium' ? 'bg-accent-warning/10 text-accent-warning' :
                      'bg-accent-success/10 text-accent-success'
                    }`}>
                      {stock.risk_level} Risk
                    </span>
                  )}
                </div>
              </div>

              {/* Price Section */}
              <div className="flex items-end gap-4">
                <p className="text-4xl font-display font-bold text-white">
                  ₹{priceData?.price?.toLocaleString('en-IN') || '—'}
                </p>
                <div className={`flex items-center gap-2 pb-1 ${isPositive ? 'text-accent-success' : 'text-accent-danger'}`}>
                  <svg className={`w-5 h-5 ${isPositive ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="font-medium">
                    {isPositive ? '+' : ''}₹{changeAmount} ({isPositive ? '+' : ''}{changePercent}%)
                  </span>
                </div>
              </div>
              <p className="text-xs text-dark-muted mt-2">
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>

            {/* About Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4">About {stock.title}</h2>
              <p className="text-dark-muted leading-relaxed">
                {stock.description || `${stock.title} (${symbol}) is a leading company listed on the Indian stock exchanges. It operates in the ${stock.sector_name || 'diversified'} sector and is classified as a ${stock.market_cap || 'multi-cap'} company.`}
              </p>
            </div>

            {/* Key Stats */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4">Key Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-dark-tertiary rounded-xl">
                  <p className="text-xs text-dark-muted mb-1">Sector</p>
                  <p className="font-medium text-white">{stock.sector_name || 'N/A'}</p>
                </div>
                <div className="p-4 bg-dark-tertiary rounded-xl">
                  <p className="text-xs text-dark-muted mb-1">Market Cap</p>
                  <p className="font-medium text-white">{stock.market_cap || 'N/A'}</p>
                </div>
                <div className="p-4 bg-dark-tertiary rounded-xl">
                  <p className="text-xs text-dark-muted mb-1">Risk Level</p>
                  <p className={`font-medium ${
                    stock.risk_level === 'High' ? 'text-accent-danger' :
                    stock.risk_level === 'Medium' ? 'text-accent-warning' :
                    'text-accent-success'
                  }`}>{stock.risk_level || 'N/A'}</p>
                </div>
                <div className="p-4 bg-dark-tertiary rounded-xl">
                  <p className="text-xs text-dark-muted mb-1">Currency</p>
                  <p className="font-medium text-white">{priceData?.currency || 'INR'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            {/* Trade Card */}
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              <h2 className="font-semibold text-white mb-4">Trade {symbol}</h2>

              {isAuthenticated ? (
                <>
                  {/* User Holdings Info */}
                  {userHolding && (
                    <div className="mb-6 p-4 bg-dark-tertiary rounded-xl">
                      <p className="text-xs text-dark-muted mb-2">Your Holdings</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold text-white">{userHolding.quantity} shares</p>
                          <p className="text-xs text-dark-muted">
                            Avg: ₹{userHolding.averageBuyPrice?.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${userHolding.profitLoss >= 0 ? 'text-accent-success' : 'text-accent-danger'}`}>
                            {userHolding.profitLoss >= 0 ? '+' : ''}₹{userHolding.profitLoss?.toFixed(2)}
                          </p>
                          <p className="text-xs text-dark-muted">P&L</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buy/Sell Toggle */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => {
                        setTradeType('buy')
                        trackClick('trade_type_toggle', { selected: 'buy', stock_symbol: symbol })
                      }}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        tradeType === 'buy'
                          ? 'bg-accent-success text-white'
                          : 'bg-dark-tertiary text-dark-muted hover:text-white'
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => {
                        setTradeType('sell')
                        trackClick('trade_type_toggle', { selected: 'sell', stock_symbol: symbol })
                      }}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        tradeType === 'sell'
                          ? 'bg-accent-danger text-white'
                          : 'bg-dark-tertiary text-dark-muted hover:text-white'
                      }`}
                    >
                      Sell
                    </button>
                  </div>

                  {/* Quantity Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-tertiary border border-dark-border rounded-xl text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                    />
                  </div>

                  {/* Total */}
                  <div className="p-4 bg-dark-tertiary rounded-xl mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-dark-muted">Price per share</span>
                      <span className="text-white">₹{priceData?.price?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-dark-muted">Quantity</span>
                      <span className="text-white">{quantity || 0}</span>
                    </div>
                    <div className="border-t border-dark-border my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-dark-muted font-medium">Total</span>
                      <span className="text-xl font-bold text-white">₹{parseFloat(totalCost).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Wallet Balance */}
                  <div className="text-sm text-dark-muted mb-4">
                    Wallet Balance:{' '}
                    <span className="text-white font-medium">
                      ₹{user?.wallet?.balance?.toLocaleString('en-IN') || '0'}
                    </span>
                  </div>

                  {/* Trade Message */}
                  {tradeMessage.text && (
                    <div className={`p-3 rounded-lg mb-4 ${
                      tradeMessage.type === 'success' 
                        ? 'bg-accent-success/10 text-accent-success' 
                        : 'bg-accent-danger/10 text-accent-danger'
                    }`}>
                      <p className="text-sm">{tradeMessage.text}</p>
                    </div>
                  )}

                  {/* Trade Button */}
                  <Button
                    onClick={handleTrade}
                    loading={trading}
                    className="w-full"
                    variant={tradeType === 'buy' ? 'success' : 'danger'}
                    size="lg"
                  >
                    {tradeType === 'buy' ? 'Buy' : 'Sell'} {symbol}
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-dark-muted mb-4">Sign in to start trading</p>
                  <div className="flex flex-col gap-2">
                    <Link to="/login">
                      <Button className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/signup">
                      <Button variant="outline" className="w-full">Create Account</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockDetail

