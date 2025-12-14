import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const stockApi = {
  getPrice: async (symbol) => {
    const response = await api.get(`/stocks/${symbol}`)
    return response.data
  },
  
  getAllPrices: async () => {
    const response = await api.get('/api/stocks')
    return response.data
  }
}

export const walletApi = {
  getBalance: async () => {
    const response = await api.get('/api/wallet')
    return response.data
  },
  
  deposit: async (amount) => {
    const response = await api.post('/api/wallet/deposit', { amount })
    return response.data
  },
  
  withdraw: async (amount) => {
    const response = await api.post('/api/wallet/withdraw', { amount })
    return response.data
  },
  
  getTransactions: async () => {
    const response = await api.get('/api/wallet/transactions')
    return {
      ...response.data,
      data: response.data.data?.transactions || []
    }
  }
}

export const tradingApi = {
  buy: async (symbol, quantity) => {
    const response = await api.post('/api/trading/buy', { symbol, quantity })
    return response.data
  },
  
  sell: async (symbol, quantity) => {
    const response = await api.post('/api/trading/sell', { symbol, quantity })
    return response.data
  },
  
  getHoldings: async () => {
    const response = await api.get('/api/trading/holdings')
    return response.data
  },
  
  getPortfolio: async () => {
    const response = await api.get('/api/trading/portfolio')
    return response.data
  }
}

export const userApi = {
  getRecentStocks: async () => {
    const response = await api.get('/api/user/recent-stocks')
    return response.data
  },
  
  trackStock: async (symbol) => {
    const response = await api.post(`/api/user/recent-stocks/${symbol}`)
    return response.data
  },
  
  clearRecentStocks: async () => {
    const response = await api.delete('/api/user/recent-stocks')
    return response.data
  }
}

