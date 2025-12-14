const CONTENTSTACK_API_KEY = import.meta.env.VITE_CONTENTSTACK_API_KEY || 'bltd32bcb22230fed0f'
const CONTENTSTACK_DELIVERY_TOKEN = import.meta.env.VITE_CONTENTSTACK_DELIVERY_TOKEN || 'cs0281bc1a5b766c893b26c830'
const CONTENTSTACK_ENVIRONMENT = import.meta.env.VITE_CONTENTSTACK_ENVIRONMENT || 'prod'
const CONTENTSTACK_REGION = 'eu'

const BASE_URL = `https://${CONTENTSTACK_REGION}-cdn.contentstack.com/v3`

const fetchFromContentstack = async (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`)
  
  params.environment = CONTENTSTACK_ENVIRONMENT
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'query' && typeof value === 'object') {
        url.searchParams.append(key, JSON.stringify(value))
      } else {
        url.searchParams.append(key, value)
      }
    }
  })

  if (params.variants) {
    console.log('[Contentstack] Final URL with variants:', url.toString())
  }

  const response = await fetch(url.toString(), {
    headers: {
      'api_key': CONTENTSTACK_API_KEY,
      'access_token': CONTENTSTACK_DELIVERY_TOKEN,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Contentstack] API error:', response.status, errorText)
    throw new Error(`Contentstack API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (params.variants) {
    console.log('[Contentstack] Response received with variants:', params.variants)
    console.log('[Contentstack] Response data keys:', Object.keys(data))
    if (data.entry) {
      console.log('[Contentstack] Entry variant info:', {
        uid: data.entry.uid,
        title: data.entry.title,
        hasVariantData: !!data.entry._variant,
        variantKeys: Object.keys(data.entry).filter(k => k.includes('variant') || k.includes('_variant'))
      })
    }
  }
  
  return data
}

const fetchFromContentstackWithVariants = async (endpoint, params = {}, variantAliases = []) => {
  if (variantAliases && variantAliases.length > 0) {
    params.variants = variantAliases.join(',')
    console.log('[Contentstack] Adding variants to request:', params.variants, 'Endpoint:', endpoint)
  }
  return fetchFromContentstack(endpoint, params)
}

export const contentstackApi = {
  getEntry: async (contentTypeUid, entryUid, options = {}, variantAliases = []) => {
    const data = await fetchFromContentstackWithVariants(
      `/content_types/${contentTypeUid}/entries/${entryUid}`,
      options,
      variantAliases
    )
    return data.entry
  },

  getEntries: async (contentTypeUid, options = {}, variantAliases = []) => {
    const data = await fetchFromContentstackWithVariants(
      `/content_types/${contentTypeUid}/entries`,
      options,
      variantAliases
    )
    return data.entries
  },

  getEntryByUrl: async (contentTypeUid, url, variantAliases = []) => {
    const data = await fetchFromContentstackWithVariants(
      `/content_types/${contentTypeUid}/entries`,
      { 'query': JSON.stringify({ url }) },
      variantAliases
    )
    return data.entries[0]
  },

  getPage: async (url, variantAliases = []) => {
    const page = await contentstackApi.getEntryByUrl('page', url, variantAliases)
    if (!page) return null

    const resolvedPage = { ...page }

    if (page.hero_section?.[0]?.uid) {
      resolvedPage.hero_section_data = await contentstackApi.getEntry(
        'hero_section',
        page.hero_section[0].uid,
        {},
        variantAliases
      )
    }

    if (page.featured_stocks?.length > 0) {
      const stockUids = page.featured_stocks.map(s => s.uid)
      const stocksData = await fetchFromContentstackWithVariants(
        '/content_types/stock/entries',
        { 'query': JSON.stringify({ uid: { '$in': stockUids } }) },
        variantAliases
      )
      resolvedPage.featured_stocks_data = stocksData.entries
    }

    return resolvedPage
  },

  getNavbar: async () => {
    const entries = await contentstackApi.getEntries('navbar')
    return entries[0]
  },

  getFooter: async () => {
    const entries = await contentstackApi.getEntries('footer')
    return entries[0]
  },

  getHeroSection: async () => {
    const entries = await contentstackApi.getEntries('hero_section')
    return entries[0]
  },

  getStock: async (symbol) => {
    const data = await fetchFromContentstack(
      '/content_types/stock/entries',
      { 'query': JSON.stringify({ symbol: symbol.toUpperCase() }) }
    )
    return data.entries[0]
  },

  getAllStocks: async (options = {}) => {
    const params = {
      limit: options.limit || 100,
      skip: options.skip || 0
    }
    
    if (options.sector) {
      params.query = JSON.stringify({ sector: options.sector })
    }
    
    // Fetch stocks and sectors in parallel
    const [stocksData, sectorsData] = await Promise.all([
      fetchFromContentstack('/content_types/stock/entries', params),
      fetchFromContentstack('/content_types/sector/entries')
    ])
    
    const sectorMap = {}
    sectorsData.entries.forEach(sector => {
      sectorMap[sector.uid] = sector.title
    })
    
    const enrichedStocks = stocksData.entries.map(stock => {
      const sectorUid = stock.sector?.[0]?.uid
      return {
        ...stock,
        sector_name: sectorUid ? sectorMap[sectorUid] : 'Unknown'
      }
    })
    
    return {
      stocks: enrichedStocks,
      count: stocksData.count || enrichedStocks.length
    }
  },

  getStocksBySymbols: async (symbols) => {
    const data = await fetchFromContentstack(
      '/content_types/stock/entries',
      { 'query': JSON.stringify({ symbol: { '$in': symbols.map(s => s.toUpperCase()) } }) }
    )
    return data.entries
  },

  getAllSectors: async () => {
    const data = await fetchFromContentstack('/content_types/sector/entries')
    return data.entries
  },

  getSector: async (uid) => {
    return contentstackApi.getEntry('sector', uid)
  },

  getAssetUrl: (asset) => {
    if (!asset) return null
    if (typeof asset === 'string') return asset
    return asset.url || asset.href || null
  }
}

export default contentstackApi

