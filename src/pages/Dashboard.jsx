import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tradingApi, walletApi, userApi } from '../services/api'
import contentstackApi from '../services/contentstack'
import Button from '../components/Button'
import StockCard from '../components/StockCard'
import PersonalizedBanner from '../components/PersonalizedBanner'

const Dashboard = () => {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState(null)
  const [recentStocks, setRecentStocks] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioData, transactionsData, recentData] = await Promise.all([
          tradingApi.getPortfolio(),
          walletApi.getTransactions().catch(() => ({ data: [] })),
          userApi.getRecentStocks().catch(() => ({ data: [] }))
        ])

        setPortfolio(portfolioData.data)
        const txData = Array.isArray(transactionsData.data) ? transactionsData.data : []
        setRecentTransactions(txData.slice(0, 5))

        // Fetch stock details for recently viewed
        const recentViewedData = Array.isArray(recentData.data) ? recentData.data : []
        if (recentViewedData.length > 0) {
          const symbols = recentViewedData.slice(0, 4).map(r => r.symbol)
          const stocksData = await contentstackApi.getStocksBySymbols(symbols)
          setRecentStocks(stocksData)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-dark-muted">
            Here's your portfolio summary
          </p>
        </div>

        {/* Personalized Banner based on Lytics segments */}
        <PersonalizedBanner />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm text-dark-muted">Net Worth</span>
            </div>
            <p className="text-2xl font-display font-bold text-white">
              ₹{portfolio?.portfolio?.totalNetWorth?.toLocaleString('en-IN') || '0'}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent-success/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm text-dark-muted">Wallet Balance</span>
            </div>
            <p className="text-2xl font-display font-bold text-white">
              ₹{portfolio?.wallet?.balance?.toLocaleString('en-IN') || '0'}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent-warning/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span className="text-sm text-dark-muted">Invested</span>
            </div>
            <p className="text-2xl font-display font-bold text-white">
              ₹{portfolio?.portfolio?.totalInvested?.toLocaleString('en-IN') || '0'}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPLPositive ? 'bg-accent-success/10' : 'bg-accent-danger/10'}`}>
                <svg className={`w-5 h-5 ${isPLPositive ? 'text-accent-success' : 'text-accent-danger'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-sm text-dark-muted">Total P&L</span>
            </div>
            <p className={`text-2xl font-display font-bold ${isPLPositive ? 'text-accent-success' : 'text-accent-danger'}`}>
              {isPLPositive ? '+' : ''}₹{totalPL.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Holdings */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-white">Your Holdings</h2>
                <Link to="/portfolio">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>

              {portfolio?.portfolio?.holdings?.length > 0 ? (
                <div className="space-y-4">
                  {portfolio.portfolio.holdings.slice(0, 5).map((holding, index) => (
                    <Link
                      key={index}
                      to={`/stock/${holding.symbol}`}
                      className="flex items-center justify-between p-4 bg-dark-tertiary rounded-xl hover:bg-dark-border transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-dark-secondary rounded-lg flex items-center justify-center">
                          <span className="font-mono text-xs font-bold text-dark-muted">
                            {holding.symbol.substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{holding.symbol}</p>
                          <p className="text-xs text-dark-muted">{holding.quantity} shares</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          ₹{holding.currentValue?.toLocaleString('en-IN')}
                        </p>
                        <p className={`text-xs ${holding.profitLoss >= 0 ? 'text-accent-success' : 'text-accent-danger'}`}>
                          {holding.profitLoss >= 0 ? '+' : ''}₹{holding.profitLoss?.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-dark-muted mb-4">No holdings yet</p>
                  <Link to="/stocks">
                    <Button size="sm">Start Investing</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Transactions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/wallet" className="p-4 bg-dark-tertiary rounded-xl text-center hover:bg-dark-border transition-colors">
                  <svg className="w-6 h-6 text-accent-success mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm text-dark-text">Add Money</span>
                </Link>
                <Link to="/wallet" className="p-4 bg-dark-tertiary rounded-xl text-center hover:bg-dark-border transition-colors">
                  <svg className="w-6 h-6 text-accent-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <span className="text-sm text-dark-text">Withdraw</span>
                </Link>
                <Link to="/stocks" className="p-4 bg-dark-tertiary rounded-xl text-center hover:bg-dark-border transition-colors">
                  <svg className="w-6 h-6 text-accent-warning mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm text-dark-text">Explore</span>
                </Link>
                <Link to="/portfolio" className="p-4 bg-dark-tertiary rounded-xl text-center hover:bg-dark-border transition-colors">
                  <svg className="w-6 h-6 text-dark-muted mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm text-dark-text">Portfolio</span>
                </Link>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white">Recent Activity</h2>
                <Link to="/wallet">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === 'DEPOSIT' ? 'bg-accent-success/10' :
                          tx.type === 'WITHDRAW' ? 'bg-accent-danger/10' :
                          tx.type === 'BUY' ? 'bg-accent-primary/10' :
                          'bg-accent-warning/10'
                        }`}>
                          <span className={`text-xs font-bold ${
                            tx.type === 'DEPOSIT' ? 'text-accent-success' :
                            tx.type === 'WITHDRAW' ? 'text-accent-danger' :
                            tx.type === 'BUY' ? 'text-accent-primary' :
                            'text-accent-warning'
                          }`}>
                            {tx.type?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-white">{tx.type}</p>
                          <p className="text-xs text-dark-muted">
                            {tx.symbol ? `${tx.quantity} × ${tx.symbol}` : new Date(tx.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm font-medium ${
                        tx.type === 'DEPOSIT' || tx.type === 'SELL' ? 'text-accent-success' : 'text-accent-danger'
                      }`}>
                        {tx.type === 'DEPOSIT' || tx.type === 'SELL' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-dark-muted py-4 text-sm">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Recently Viewed */}
        {recentStocks.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-white">Recently Viewed</h2>
              <Link to="/stocks">
                <Button variant="ghost" size="sm">Browse All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentStocks.map(stock => (
                <StockCard key={stock.uid} stock={stock} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

