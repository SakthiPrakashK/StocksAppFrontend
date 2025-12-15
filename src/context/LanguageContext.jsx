import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext(null)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LANGUAGES = {
  'en-us': { name: 'English', flag: '🇺🇸', nativeName: 'English' },
  'fr': { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  'es': { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  'hi-in': { name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  'ta-in': { name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' }
}

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('locale') || 'en-us'
  })

  useEffect(() => {
    localStorage.setItem('locale', locale)
  }, [locale])

  const changeLanguage = (newLocale) => {
    if (LANGUAGES[newLocale]) {
      setLocale(newLocale)
      window.location.reload()
    }
  }

  const value = {
    locale,
    currentLanguage: LANGUAGES[locale],
    changeLanguage,
    availableLanguages: LANGUAGES
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

