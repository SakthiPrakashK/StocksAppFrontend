import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getVariantAliases, getPersonalize } from '../services/personalize'
import { getUserSegments } from '../services/lytics'
import personalizedContent from '../services/personalizedContent'

export const usePersonalizedContent = () => {
  const { user, isAuthenticated } = useAuth()
  const [variantAliases, setVariantAliases] = useState([])
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPersonalization = async () => {
      if (isAuthenticated && user) {
        try {
          const userSegments = await getUserSegments()
          setSegments(userSegments)

          const sdk = getPersonalize()
          if (sdk) {
            const aliases = getVariantAliases()
            setVariantAliases(aliases)
          }
        } catch (error) {
          console.error('Failed to load personalization:', error)
        }
      }
      setLoading(false)
    }

    loadPersonalization()
  }, [isAuthenticated, user])

  const getPersonalizedEntry = useCallback(async (contentTypeUid, entryUid) => {
    if (!isAuthenticated || !user) {
      return null
    }
    return await personalizedContent.getPersonalizedEntry(
      contentTypeUid,
      entryUid,
      user.id || user._id,
      user.email
    )
  }, [isAuthenticated, user])

  const getPersonalizedEntries = useCallback(async (contentTypeUid, options = {}) => {
    if (!isAuthenticated || !user) {
      return []
    }
    return await personalizedContent.getPersonalizedEntries(
      contentTypeUid,
      options,
      user.id || user._id,
      user.email
    )
  }, [isAuthenticated, user])

  const getPersonalizedPage = useCallback(async (url) => {
    if (!isAuthenticated || !user) {
      return null
    }
    return await personalizedContent.getPersonalizedPage(
      url,
      user.id || user._id,
      user.email
    )
  }, [isAuthenticated, user])

  const getPersonalizedStock = useCallback(async (symbol) => {
    if (!isAuthenticated || !user) {
      return null
    }
    return await personalizedContent.getPersonalizedStock(
      symbol,
      user.id || user._id,
      user.email
    )
  }, [isAuthenticated, user])

  return {
    variantAliases,
    segments,
    loading,
    hasPersonalization: variantAliases.length > 0,
    getPersonalizedEntry,
    getPersonalizedEntries,
    getPersonalizedPage,
    getPersonalizedStock
  }
}

export default usePersonalizedContent

