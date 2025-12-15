import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { trackClick } from '../services/lytics'

const LanguageSwitcher = () => {
  const { locale, currentLanguage, changeLanguage, availableLanguages } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (newLocale) => {
    trackClick('language_change', { 
      from_language: locale, 
      to_language: newLocale 
    })
    changeLanguage(newLocale)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-tertiary transition-colors"
        aria-label="Change language"
      >
        <span className="text-xl">{currentLanguage?.flag}</span>
        <span className="hidden sm:block text-sm font-medium text-dark-text">
          {currentLanguage?.nativeName}
        </span>
        <svg 
          className={`w-4 h-4 text-dark-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-dark-border">
              <p className="text-xs font-medium text-dark-muted uppercase tracking-wide">
                Select Language
              </p>
            </div>
            <div className="py-1 max-h-80 overflow-y-auto">
              {Object.entries(availableLanguages).map(([code, language]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    locale === code
                      ? 'bg-accent-primary/10 text-accent-primary'
                      : 'text-dark-text hover:bg-dark-tertiary'
                  }`}
                >
                  <span className="text-2xl">{language.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-dark-muted">{language.name}</div>
                  </div>
                  {locale === code && (
                    <svg className="w-5 h-5 text-accent-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSwitcher

