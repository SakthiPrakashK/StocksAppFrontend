import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserSegments, getPersonalizationFlags } from '../services/lytics'

/**
 * Example component showing personalization based on Lytics segments
 * This banner shows different content based on user's segment membership
 */
const PersonalizedBanner = () => {
  const [personalization, setPersonalization] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSegments = async () => {
      try {
        const flags = await getPersonalizationFlags()
        setPersonalization(flags)
      } catch (error) {
        console.error('Failed to load segments:', error)
      } finally {
        setLoading(false)
      }
    }

    // Delay to allow Lytics SDK to initialize
    const timer = setTimeout(loadSegments, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (loading || !personalization) {
    return null
  }

  // High-value traders get premium experience
  if (personalization.isHighValueTrader) {
    return (
      <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L10 6.477V16h2a1 1 0 110 2H8a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-yellow-400 font-semibold">Premium Trader Benefits</h3>
            <p className="text-sm text-dark-muted">You're in our top traders! Enjoy priority support and exclusive insights.</p>
          </div>
        </div>
      </div>
    )
  }

  // New users get welcome message
  if (personalization.isNewUser) {
    return (
      <div className="bg-gradient-to-r from-accent-primary/20 to-accent-success/20 border border-accent-primary/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-primary/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Welcome to StockApp! 🎉</h3>
              <p className="text-sm text-dark-muted">Start your trading journey with ₹1,000 bonus credits.</p>
            </div>
          </div>
          <Link 
            to="/wallet" 
            className="px-4 py-2 bg-accent-primary text-white text-sm font-medium rounded-lg hover:bg-accent-primary/90"
          >
            Claim Bonus
          </Link>
        </div>
      </div>
    )
  }

  // At-risk users get re-engagement message
  if (personalization.isAtRisk) {
    return (
      <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-orange-400 font-semibold">Markets are moving!</h3>
              <p className="text-sm text-dark-muted">Check out trending stocks before you miss the opportunity.</p>
            </div>
          </div>
          <Link 
            to="/stocks" 
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600"
          >
            Explore Now
          </Link>
        </div>
      </div>
    )
  }

  // Window shoppers get conversion nudge
  if (personalization.isWindowShopper) {
    return (
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-purple-400 font-semibold">Ready to start trading?</h3>
              <p className="text-sm text-dark-muted">Add funds to your wallet and make your first trade today!</p>
            </div>
          </div>
          <Link 
            to="/wallet" 
            className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600"
          >
            Add Funds
          </Link>
        </div>
      </div>
    )
  }

  // Default - no banner
  return null
}

export default PersonalizedBanner

