import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Stocks from './pages/Stocks'
import StockDetail from './pages/StockDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Portfolio from './pages/Portfolio'
import Wallet from './pages/Wallet'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { trackPageView, startSessionTracking } from './services/lytics'

// Page view tracker component
const LyticsTracker = () => {
  const location = useLocation()

  // Start session tracking on mount
  useEffect(() => {
    startSessionTracking()
  }, [])

  // Track page views on route change
  useEffect(() => {
    const getPageName = (path) => {
      const routes = {
        '/': 'Home',
        '/stocks': 'Explore Stocks',
        '/dashboard': 'Dashboard',
        '/portfolio': 'Portfolio',
        '/wallet': 'Wallet',
        '/profile': 'Profile',
        '/login': 'Login',
        '/signup': 'Sign Up',
        '/about': 'About'
      }

      if (path.startsWith('/stock/')) {
        const symbol = path.split('/stock/')[1]
        return `Stock Detail - ${symbol.toUpperCase()}`
      }

      return routes[path] || path
    }

    const pageName = getPageName(location.pathname)
    trackPageView(pageName, {
      search: location.search,
      hash: location.hash
    })
  }, [location])

  return null
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LyticsTracker />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/stock/:symbol" element={<StockDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App


