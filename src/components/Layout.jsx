import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import contentstackApi from '../services/contentstack'
import { useLanguage } from '../context/LanguageContext'

const Layout = ({ children }) => {
  const { locale } = useLanguage()
  const [navbarData, setNavbarData] = useState(null)
  const [footerData, setFooterData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLayoutData = async () => {
      setLoading(true)
      try {
        const [navbar, footer] = await Promise.all([
          contentstackApi.getNavbar(),
          contentstackApi.getFooter()
        ])
        setNavbarData(navbar)
        setFooterData(footer)
      } catch (error) {
        console.error('Failed to fetch layout data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLayoutData()
  }, [locale])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-primary flex flex-col">
      <Navbar data={navbarData} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer data={footerData} />
    </div>
  )
}

export default Layout


