import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import contentstackApi from '../services/contentstack'
import { userApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { usePersonalizedContent } from '../hooks/usePersonalizedContent'
import { useTranslation } from '../locales/translations'
import StockCard from '../components/StockCard'
import Button from '../components/Button'

const Home = () => {
  const { isAuthenticated, user } = useAuth()
  const { locale } = useLanguage()
  const { t } = useTranslation(locale)
  const { getPersonalizedPage, variantAliases, hasPersonalization } = usePersonalizedContent()
  const [pageData, setPageData] = useState(null)
  const [heroData, setHeroData] = useState(null)
  const [featuredStocks, setFeaturedStocks] = useState([])
  const [recentStocks, setRecentStocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        let page
        if (isAuthenticated && user && hasPersonalization) {
          page = await getPersonalizedPage('/')
        } else {
          page = await contentstackApi.getPage('/')
        }
        setPageData(page)

        if (page?.hero_section_data) {
          setHeroData(page.hero_section_data)
        } else {
          const hero = await contentstackApi.getHeroSection()
          setHeroData(hero)
        }

        if (page?.featured_stocks_data) {
          setFeaturedStocks(page.featured_stocks_data)
        }

        // Fetch recent stocks for authenticated users
        if (isAuthenticated) {
          try {
            const recentResponse = await userApi.getRecentStocks()
            if (recentResponse.data?.length > 0) {
              const recentSymbols = recentResponse.data.map(r => r.symbol)
              const stocksData = await contentstackApi.getStocksBySymbols(recentSymbols)
              setRecentStocks(stocksData)
            }
          } catch (error) {
            console.error('Failed to fetch recent stocks:', error)
          }
        }
      } catch (error) {
        console.error('Failed to fetch home page data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, user, getPersonalizedPage, hasPersonalization, locale])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden"
        style={{ backgroundColor: heroData?.color || pageData?.color || '#0D1117' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(88, 166, 255, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(63, 185, 80, 0.1) 0%, transparent 50%)`
          }}></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-primary/10 rounded-full mb-6">
                <span className="w-2 h-2 bg-accent-success rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-accent-primary">{t('markets_open')}</span>
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                {heroData?.headline || 'Invest in India\'s Top Stocks'}
              </h1>
              
              <p className="text-lg text-dark-muted mb-8 max-w-xl">
                {heroData?.subheadline || 'Trade NIFTY 50 stocks with confidence. Real-time prices, detailed insights, and seamless transactions.'}
              </p>

              {heroData?.description && (
                <p className="text-base text-dark-muted/80 mb-8 max-w-xl">
                  {heroData.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                <Link to={heroData?.cta_primary_url?.href || '/stocks'}>
                  <Button size="lg" className="shadow-lg shadow-accent-primary/25">
                    {heroData?.cta_primary_text || 'Explore Stocks'}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                {!isAuthenticated && heroData?.cta_secondary_text && (
                  <Link to={heroData?.cta_secondary_url?.href || '/signup'}>
                    <Button variant="outline" size="lg">
                      {heroData.cta_secondary_text}
                    </Button>
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-dark-border/50">
                <div>
                  <p className="text-3xl font-display font-bold text-white">100+</p>
                  <p className="text-sm text-dark-muted">{t('stats_stocks')}</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-white">10+</p>
                  <p className="text-sm text-dark-muted">{t('stats_sectors')}</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-white">₹0</p>
                  <p className="text-sm text-dark-muted">{t('stats_commission')}</p>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-8 -left-8 w-64 glass-card rounded-2xl p-5 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent-primary rounded-lg flex items-center justify-center">
                    <span className="font-mono font-bold text-sm text-white">TCS</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">TCS</p>
                    <p className="text-xs text-dark-muted">Tata Consultancy</p>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xl font-bold text-white">₹3,800</p>
                  <span className="text-accent-success text-sm">+2.34%</span>
                </div>
              </div>

              <div className="absolute top-20 right-0 w-64 glass-card rounded-2xl p-5 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent-success rounded-lg flex items-center justify-center">
                    <span className="font-mono font-bold text-sm text-white">REL</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">RELIANCE</p>
                    <p className="text-xs text-dark-muted">Reliance Industries</p>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xl font-bold text-white">₹2,450</p>
                  <span className="text-accent-success text-sm">+1.56%</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-12 w-64 glass-card rounded-2xl p-5 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent-warning rounded-lg flex items-center justify-center">
                    <span className="font-mono font-bold text-sm text-white">HDB</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">HDFCBANK</p>
                    <p className="text-xs text-dark-muted">HDFC Bank Limited</p>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xl font-bold text-white">₹1,500</p>
                  <span className="text-accent-danger text-sm">-0.42%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stocks Section */}
      {featuredStocks.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                  {t('featured_stocks')}
                </h2>
                <p className="text-dark-muted">
                  {t('featured_stocks_subtitle')}
                </p>
              </div>
              <Link to="/stocks">
                <Button variant="ghost">
                  {t('view_all')}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredStocks.slice(0, 8).map((stock) => (
                <StockCard key={stock.uid} stock={stock} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Stocks Section (Authenticated Users Only) */}
      {isAuthenticated && recentStocks.length > 0 && (
        <section className="py-16 lg:py-24 bg-dark-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                  {t('recently_viewed')}
                </h2>
                <p className="text-dark-muted">
                  {t('recently_viewed_subtitle')}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentStocks.slice(0, 4).map((stock) => (
                <StockCard key={stock.uid} stock={stock} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-card rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-success/10"></div>
              <div className="relative">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                  {t('start_journey')}
                </h2>
                <p className="text-dark-muted mb-8 max-w-2xl mx-auto">
                  {t('start_journey_subtitle')}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/signup">
                    <Button size="lg">
                      {t('create_free_account')}
                    </Button>
                  </Link>
                  <Link to="/stocks">
                    <Button variant="outline" size="lg">
                      {t('explore_stocks_first')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-dark-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
              {t('why_choose')}
            </h2>
            <p className="text-dark-muted max-w-2xl mx-auto">
              {t('why_choose_subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-accent-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">{t('realtime_prices')}</h3>
              <p className="text-sm text-dark-muted">
                {t('realtime_prices_desc')}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-accent-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-accent-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">{t('secure_trading')}</h3>
              <p className="text-sm text-dark-muted">
                {t('secure_trading_desc')}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-accent-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-accent-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">{t('detailed_analytics')}</h3>
              <p className="text-sm text-dark-muted">
                {t('detailed_analytics_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home


