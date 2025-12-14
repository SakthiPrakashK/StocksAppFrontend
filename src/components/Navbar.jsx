import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { trackNavigation, trackClick } from '../services/lytics'

const Navbar = ({ data }) => {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Default menu items with icons
  const defaultMenuItems = [
    { 
      label: 'Home', 
      url: '/', 
      is_active: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      label: 'Stocks', 
      url: '/stocks', 
      is_active: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      label: 'Dashboard', 
      url: '/dashboard', 
      is_active: true,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    }
  ]

  // Use Contentstack data if available, otherwise use defaults
  const menuItems = data?.menu_items?.length > 0 
    ? data.menu_items.map((item, idx) => ({
        ...item,
        icon: defaultMenuItems[idx]?.icon || defaultMenuItems[0].icon
      }))
    : defaultMenuItems

  const isActive = (url) => location.pathname === url

  return (
    <nav 
      className="sticky top-0 z-50 glass-card border-b border-dark-border"
      style={{ backgroundColor: data?.color || '#0D1117' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {data?.logo?.url ? (
              <img src={data.logo.url} alt={data.brand_name || 'StockApp'} className="h-8 w-auto" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-success rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="font-display font-bold text-xl text-white">
                  {data?.brand_name || 'StockApp'}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.filter(item => item.is_active).map((item, index) => (
              <Link
                key={index}
                to={item.url}
                onClick={() => trackNavigation(item.label, item.url)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.url)
                    ? 'bg-dark-tertiary text-white'
                    : 'text-dark-muted hover:text-white hover:bg-dark-tertiary/50'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-tertiary transition-colors"
                >
                  <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-dark-text">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <svg className="w-4 h-4 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-dark-border">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-dark-muted truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-dark-text hover:bg-dark-tertiary"
                        onClick={() => {
                          setUserMenuOpen(false)
                          trackNavigation('Dashboard', '/dashboard')
                        }}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/portfolio"
                        className="block px-4 py-2 text-sm text-dark-text hover:bg-dark-tertiary"
                        onClick={() => {
                          setUserMenuOpen(false)
                          trackNavigation('Portfolio', '/portfolio')
                        }}
                      >
                        Portfolio
                      </Link>
                      <Link
                        to="/wallet"
                        className="block px-4 py-2 text-sm text-dark-text hover:bg-dark-tertiary"
                        onClick={() => {
                          setUserMenuOpen(false)
                          trackNavigation('Wallet', '/wallet')
                        }}
                      >
                        Wallet
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-dark-text hover:bg-dark-tertiary"
                        onClick={() => {
                          setUserMenuOpen(false)
                          trackNavigation('Profile', '/profile')
                        }}
                      >
                        Profile
                      </Link>
                    </div>
                    <div className="py-1 border-t border-dark-border">
                      <button
                        onClick={() => {
                          logout()
                          setUserMenuOpen(false)
                          trackClick('sign_out', { source: 'navbar_dropdown' })
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-accent-danger hover:bg-dark-tertiary"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => trackClick('sign_in_button', { source: 'navbar' })}
                  className="px-4 py-2 text-sm font-medium text-dark-text hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => trackClick('get_started_button', { source: 'navbar' })}
                  className="px-4 py-2 bg-accent-primary text-white text-sm font-medium rounded-lg hover:bg-accent-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-dark-tertiary"
            >
              <svg className="w-6 h-6 text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-border">
            <div className="flex flex-col gap-1">
              {menuItems.filter(item => item.is_active).map((item, index) => (
                <Link
                  key={index}
                  to={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive(item.url)
                      ? 'bg-dark-tertiary text-white'
                      : 'text-dark-muted hover:text-white hover:bg-dark-tertiary/50'
                  }`}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    trackNavigation(item.label, item.url)
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

