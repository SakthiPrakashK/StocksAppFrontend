import { getVariantAliases, initPersonalizeWithUser, refreshPersonalizeForUser } from './personalize'
import { getUserSegments } from './lytics'
import contentstackApi from './contentstack'

export const getPersonalizedEntry = async (contentTypeUid, entryUid, userId = null, userEmail = null) => {
  try {
    let variantAliases = []
    
    if (userId) {
      await initPersonalizeWithUser(userId, userEmail)
      variantAliases = getVariantAliases()
    }

    const entry = await contentstackApi.getEntry(contentTypeUid, entryUid, {}, variantAliases)
    return entry
  } catch (error) {
    console.error('Failed to get personalized entry:', error)
    return await contentstackApi.getEntry(contentTypeUid, entryUid)
  }
}

export const getPersonalizedEntries = async (contentTypeUid, options = {}, userId = null, userEmail = null) => {
  try {
    let variantAliases = []
    
    if (userId) {
      await initPersonalizeWithUser(userId, userEmail)
      variantAliases = getVariantAliases()
    }

    const entries = await contentstackApi.getEntries(contentTypeUid, options, variantAliases)
    return entries
  } catch (error) {
    console.error('Failed to get personalized entries:', error)
    return await contentstackApi.getEntries(contentTypeUid, options)
  }
}

export const getPersonalizedPage = async (url, userId = null, userEmail = null) => {
  try {
    let variantAliases = []
    
    if (userId) {
      await initPersonalizeWithUser(userId, userEmail)
      variantAliases = getVariantAliases()
      console.log('[Personalize] Variant aliases for user:', variantAliases)
    }

    if (variantAliases.length > 0) {
      console.log('[Personalize] Fetching page with variants:', variantAliases)
    }
    
    const page = await contentstackApi.getPage(url, variantAliases)
    
    if (variantAliases.length > 0) {
      console.log('[Personalize] Page response received:', page?.title, 'Variants applied:', variantAliases)
    }
    
    return page
  } catch (error) {
    console.error('Failed to get personalized page:', error)
    return await contentstackApi.getPage(url)
  }
}

export const getPersonalizedStock = async (symbol, userId = null, userEmail = null) => {
  try {
    let variantAliases = []
    
    if (userId) {
      await initPersonalizeWithUser(userId, userEmail)
      variantAliases = getVariantAliases()
    }

    const stock = await contentstackApi.getStock(symbol)
    if (variantAliases.length > 0) {
      const personalizedStock = await contentstackApi.getEntry('stock', stock.uid, {}, variantAliases)
      return personalizedStock || stock
    }
    return stock
  } catch (error) {
    console.error('Failed to get personalized stock:', error)
    return await contentstackApi.getStock(symbol)
  }
}

export const getUserVariantAliases = async (userId = null, userEmail = null) => {
  try {
    if (!userId) {
      return []
    }

    await initPersonalizeWithUser(userId, userEmail)
    return getVariantAliases()
  } catch (error) {
    console.error('Failed to get user variant aliases:', error)
    return []
  }
}

export const getUserSegmentsAndVariants = async (userId = null, userEmail = null) => {
  try {
    const segments = await getUserSegments()
    let variantAliases = []
    
    if (userId) {
      await initPersonalizeWithUser(userId, userEmail)
      variantAliases = getVariantAliases()
    }

    return {
      segments,
      variantAliases,
      hasPersonalization: variantAliases.length > 0
    }
  } catch (error) {
    console.error('Failed to get user segments and variants:', error)
    return {
      segments: [],
      variantAliases: [],
      hasPersonalization: false
    }
  }
}

export default {
  getPersonalizedEntry,
  getPersonalizedEntries,
  getPersonalizedPage,
  getPersonalizedStock,
  getUserVariantAliases,
  getUserSegmentsAndVariants
}

