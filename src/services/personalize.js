import Personalize from '@contentstack/personalize-edge-sdk'
import { getUserSegments } from './lytics'

let personalizeSdk = null
let personalizeInitialized = false

const CONTENTSTACK_REGION = 'eu'
const PERSONALIZE_EDGE_API_URL = `https://${CONTENTSTACK_REGION}-personalize-edge.contentstack.com`

export const initPersonalize = async (config = {}) => {
  const hasUserInfo = config.userId || config.liveAttributes
  
  if (personalizeInitialized && personalizeSdk) {
    if (hasUserInfo) {
      console.log('[Personalize] Reinitializing SDK with user info')
      personalizeInitialized = false
      personalizeSdk = null
    } else {
      console.warn('Personalize SDK already initialized')
      return personalizeSdk
    }
  }

  try {
    const projectUid = config.projectUid || import.meta.env.VITE_PERSONALIZE_PROJECT_UID

    if (!projectUid) {
      console.error('Personalize SDK: projectUid is required')
      return null
    }

    if (Personalize.setEdgeApiUrl) {
      Personalize.setEdgeApiUrl(PERSONALIZE_EDGE_API_URL)
      console.log('[Personalize] Set Edge API URL to:', PERSONALIZE_EDGE_API_URL)
    }

    const initOptions = {}
    
    if (config.userId) {
      initOptions.userId = config.userId
    }

    if (config.liveAttributes) {
      initOptions.liveAttributes = config.liveAttributes
    }

    personalizeSdk = await Personalize.init(projectUid, Object.keys(initOptions).length > 0 ? initOptions : undefined)

    personalizeInitialized = true
    console.log('[Personalize] SDK initialized successfully', {
      projectUid,
      userId: initOptions.userId,
      hasLiveAttributes: !!initOptions.liveAttributes
    })
    
    const experiences = personalizeSdk.getExperiences()
    const variantAliases = personalizeSdk.getVariantAliases()
    console.log('[Personalize] Initial experiences:', experiences)
    console.log('[Personalize] Initial variant aliases:', variantAliases)
    
    return personalizeSdk
  } catch (error) {
    console.error('Failed to initialize Personalize SDK:', error)
    return null
  }
}

export const getPersonalize = () => {
  if (!personalizeInitialized || !personalizeSdk) {
    console.warn('Personalize SDK not initialized. Call initPersonalize() first.')
    return null
  }
  return personalizeSdk
}

export const getExperiences = () => {
  const sdk = getPersonalize()
  if (!sdk) return []
  return sdk.getExperiences()
}

export const getVariants = () => {
  const sdk = getPersonalize()
  if (!sdk) {
    console.warn('[Personalize] SDK not initialized, cannot get variants')
    return {}
  }
  const variants = sdk.getVariants ? sdk.getVariants() : {}
  console.log('[Personalize] Variants from SDK:', variants)
  return variants
}

export const getVariantAliases = () => {
  const sdk = getPersonalize()
  if (!sdk) {
    console.warn('[Personalize] SDK not initialized, cannot get variant aliases')
    return []
  }
  const aliases = sdk.getVariantAliases ? sdk.getVariantAliases() : []
  console.log('[Personalize] Variant aliases from SDK:', aliases)
  
  if (aliases.length === 0) {
    const variants = getVariants()
    console.log('[Personalize] No variant aliases, checking variants object:', variants)
  }
  
  return aliases
}

export const triggerEvent = async (eventKey) => {
  const sdk = getPersonalize()
  if (!sdk) {
    console.warn('Personalize SDK not initialized. Cannot trigger event.')
    return
  }
  try {
    await sdk.triggerEvent(eventKey)
  } catch (error) {
    console.error('Failed to trigger event:', error)
  }
}

export const setUserAttributes = async (attributes) => {
  const sdk = getPersonalize()
  if (!sdk) {
    console.warn('Personalize SDK not initialized. Cannot set user attributes.')
    return
  }
  try {
    await sdk.set(attributes)
  } catch (error) {
    console.error('Failed to set user attributes:', error)
  }
}

export const initPersonalizeWithUser = async (userId, userEmail = null) => {
  try {
    const lyticsSegments = await getUserSegments()
    
    console.log('[Personalize] Initializing with user:', {
      userId,
      userEmail,
      segments: lyticsSegments,
      segmentsCount: lyticsSegments?.length || 0
    })
    
    const initOptions = {
      userId: userId
    }

    if (userEmail) {
      initOptions.liveAttributes = {
        email: userEmail,
        segments: lyticsSegments
      }
    }

    const result = await initPersonalize(initOptions)
    
    if (result) {
      const experiences = result.getExperiences()
      const variantAliases = result.getVariantAliases()
      
      console.log('[Personalize] After user initialization:')
      console.log('  - Experiences:', experiences)
      console.log('  - Variant Aliases:', variantAliases)
      
      if (variantAliases.length === 0) {
        console.warn('[Personalize] ⚠️ No variant aliases found. Possible reasons:')
        console.warn('  1. User segments do not match any audience conditions')
        console.warn('  2. Variants are not published in Contentstack')
        console.warn('  3. Segment names in Lytics do not match audience names in Personalize')
        console.warn('  Current user segments:', lyticsSegments)
      }
    }
    
    return result
  } catch (error) {
    console.error('Failed to initialize Personalize with user:', error)
    return null
  }
}

export const refreshPersonalizeForUser = async (userId, userEmail = null) => {
  personalizeInitialized = false
  personalizeSdk = null
  return await initPersonalizeWithUser(userId, userEmail)
}

export default {
  init: initPersonalize,
  initWithUser: initPersonalizeWithUser,
  refreshForUser: refreshPersonalizeForUser,
  getInstance: getPersonalize,
  getExperiences,
  getVariantAliases,
  triggerEvent,
  setUserAttributes
}

