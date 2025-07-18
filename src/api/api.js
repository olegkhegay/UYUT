import axios from 'axios'
import {
  API_CONFIG,
  createRequestInterceptor,
  createResponseInterceptor,
  handleApiError,
  API_ERROR_TYPES
} from '../config/api.js'

// Get auth token from storage
const getAuthToken = () => {
  try {
    // Проверяем localStorage сначала
    const localData = localStorage.getItem('auth-store')
    if (localData) {
      const parsed = JSON.parse(localData)
      if (parsed.state?.user?.token) {
        return parsed.state.user.token
      }
    }

    // Проверяем cookies как fallback
    const cookieData = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
    
    if (cookieData) {
      return cookieData.split('=')[1]
    }

    return null
  } catch (error) {
    console.warn('⚠️ Failed to get auth token:', error)
    return null
  }
}

// Create axios instance
const createApiClient = () => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add auth interceptor
  client.interceptors.request.use(
    (config) => {
      const token = getAuthToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Setup other interceptors
  createRequestInterceptor(client)
  createResponseInterceptor(client)

  return client
}

// Main API client
export const apiClient = createApiClient()

// Retry mechanism for failed requests
const retryRequest = async (fn, retries = API_CONFIG.RETRY_COUNT) => {
  try {
    return await fn()
  } catch (error) {
    // Handle auth errors first
    const handledError = handle401Error(error)
    
    if (retries > 0 && shouldRetry(handledError)) {
      console.log(`[API] Retrying request. Attempts left: ${retries}`)
      await delay(API_CONFIG.RETRY_DELAY)
      return retryRequest(fn, retries - 1)
    }
    throw handledError
  }
}

// Check if request should be retried
const shouldRetry = (error) => {
  if (error.type === API_ERROR_TYPES.NETWORK_ERROR) return true
  if (error.type === API_ERROR_TYPES.TIMEOUT_ERROR) return true
  if (error.status >= 500) return true
  // Don't retry 401 (Unauthorized) errors
  if (error.status === 401) return false
  return false
}

// Handle 401 Unauthorized errors
const handle401Error = (error) => {
  if (error.response?.status === 401) {
    console.warn('🔐 API: Unauthorized access detected, clearing auth data')
    
    // Clear auth data
    localStorage.removeItem('auth-store')
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // Notify user (could emit event or redirect)
    window.dispatchEvent(new CustomEvent('auth:unauthorized', {
      detail: { message: 'Authentication expired. Please log in again.' }
    }))
    
    return {
      ...error,
      isAuthError: true,
      message: 'Требуется авторизация для выполнения этого действия'
    }
  }
  return error
}

// Delay utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Generic API methods with retry
export const api = {
  // GET request
  get: async (url, config = {}) => {
    return retryRequest(async () => {
      const response = await apiClient.get(url, config)
      return response.data
    })
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    return retryRequest(async () => {
      const response = await apiClient.post(url, data, config)
      return response.data
    })
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    return retryRequest(async () => {
      const response = await apiClient.put(url, data, config)
      return response.data
    })
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    return retryRequest(async () => {
      const response = await apiClient.patch(url, data, config)
      return response.data
    })
  },

  // DELETE request
  delete: async (url, config = {}) => {
    return retryRequest(async () => {
      const response = await apiClient.delete(url, config)
      return response.data
    })
  },

  // Upload file
  upload: async (url, formData, config = {}) => {
    const uploadConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
      onUploadProgress: config.onUploadProgress,
    }

    return retryRequest(async () => {
      const response = await apiClient.post(url, formData, uploadConfig)
      return response.data
    })
  },

  // Download file
  download: async (url, config = {}) => {
    const downloadConfig = {
      ...config,
      responseType: 'blob',
    }

    return retryRequest(async () => {
      const response = await apiClient.get(url, downloadConfig)
      return response
    })
  },
}

// Request cancellation utility
export const createCancelToken = () => {
  return axios.CancelToken.source()
}

// Check if error is cancellation
export const isCancel = (error) => {
  return axios.isCancel(error)
}

// Health check utility
export const healthCheck = async () => {
  try {
    const response = await api.get('/health')
    return { status: 'healthy', data: response }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}

export default api
