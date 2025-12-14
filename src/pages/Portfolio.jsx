import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tradingApi } from '../services/api'
import Button from '../components/Button'

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await tradingApi.getPortfolio()
        setPortfolio(data.data)
      } catch (error) {
        console.error('Failed to fetch portfolio:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  const totalPL = portfolio?.portfolio?.totalProfitLoss || 0
  const isPLPositive = totalPL >= 0
  const plPercentage = portfolio?.portfolio?.totalInvested 
    ? ((totalPL / portfolio.portfolio.totalInvested) * 100).toFixed(2)
    : 0

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            Portfolio
          </h1>
          <p className="text-dark-muted">
            Track your investments and performance
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-dark-muted mb-1">Current Value</p>
              <p className="text-3xl font-display font-bold text-white">
                ₹{portfolio?.portfolio?.totalCurrentValue?.toLocaleString('en-IN') || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-dark-muted mb-1">Total Invested</p>
              <p className="text-3xl font-display font-bold text-white">
                ₹{portfolio?.portfolio?.totalInvested?.toLocaleString('en-IN') || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-dark-muted mb-1">Total Profit/Loss</p>
              <p className={`text-3xl font-display font-bold ${isPLPositive ? 'text-accent-success' : 'text-accent-danger'}`}>
                {isPLPositive ? '+' : ''}₹{totalPL.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-sm text-dark-muted mb-1">Returns</p>
              <p className={`text-3xl font-display font-bold ${isPLPositive ? 'text-accent-success' : 'text-accent-danger'}`}>
                {isPLPositive ? '+' : ''}{plPercentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-dark-border">
            <h2 className="font-semibold text-white">Holdings ({portfolio?.portfolio?.holdings?.length || 0})</h2>
          </div>

          {portfolio?.portfolio?.holdings?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-tertiary">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-dark-muted">Stock</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-dark-muted">Quantity</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-dark-muted">Avg. Price</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-dark-muted">Current Price</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-dark-muted">Current Value</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-dark-muted">P&L</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-dark-muted">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {portfolio.portfolio.holdings.map((holding, index) => {
                    const isHoldingPositive = holding.profitLoss >= 0
                    const holdingPLPercent = holding.totalInvested 
                      ? ((holding.profitLoss / holding.totalInvested) * 100).toFixed(2)
                      : 0

                    return (
                      <tr key={index} className="hover:bg-dark-tertiary/50 transition-colors">
                        <td className="px-6 py-4">
                          <Link to={`/stock/${holding.symbol}`} className="flex items-center gap-3 hover:text-accent-primary">
                            <div className="w-10 h-10 bg-dark-tertiary rounded-lg flex items-center justify-center">
                              <span className="font-mono text-xs font-bold text-dark-muted">
                                {holding.symbol.substring(0, 2)}
                              </span>
                            </div>
                            <span className="font-medium text-white">{holding.symbol}</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right text-white">{holding.quantity}</td>
                        <td className="px-6 py-4 text-right text-white">₹{holding.averageBuyPrice?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-white">₹{holding.currentPrice?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-white">₹{holding.currentValue?.toLocaleString('en-IN')}</td>
                        <td className={`px-6 py-4 text-right ${isHoldingPositive ? 'text-accent-success' : 'text-accent-danger'}`}>
                          <div>
                            <p>{isHoldingPositive ? '+' : ''}₹{holding.profitLoss?.toFixed(2)}</p>
                            <p className="text-xs">({isHoldingPositive ? '+' : ''}{holdingPLPercent}%)</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/stock/${holding.symbol}`}>
                            <Button variant="ghost" size="sm">Trade</Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No holdings yet</h3>
              <p className="text-dark-muted mb-6">Start building your portfolio today</p>
              <Link to="/stocks">
                <Button>Explore Stocks</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Portfolio


