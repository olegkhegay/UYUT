// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://backend.uyut.kr',
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
}

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/user/login',
    REGISTER: '/user/register',
    GET_USER: (telegramUserId) => `/user/${telegramUserId}`,
  },
  
  // Menu (используем только /category - содержит все блюда в menuItems)
  MENU: {
    CATEGORIES: '/category', // ✅ Содержит все блюда в категориях menuItems[]
    DISH_BY_ID: (id) => `/menu/dishes/${id}`,
    INGREDIENTS: '/menu/ingredients',
    // Deprecated endpoints (для совместимости)
    DISHES: '/menu/dishes',
  },

  // Custom Meal Builder (✅ Обновлено согласно Swagger)
  CUSTOM_MEAL: {
    // Получение кастомного блюда по ID (требует аутентификацию)
    GET_BY_ID: (id) => `/custom-meal/${id}`,
    // Создание кастомного блюда
    CREATE: '/custom-meal',
    // Обновление кастомного блюда
    UPDATE: (id) => `/custom-meal/${id}`,
    // Удаление кастомного блюда  
    DELETE: (id) => `/custom-meal/${id}`,
    // Получение списка кастомных блюд пользователя
    GET_USER_MEALS: '/custom-meal/user',
    // Получение категорий ингредиентов (возможно через ingredients API)
    INGREDIENT_CATEGORIES: '/ingredients/categories',
    // Получение ингредиентов
    INGREDIENTS: '/ingredients',
    // Валидация блюда
    VALIDATE: '/custom-meal/validate',
    // Расчет цены
    CALCULATE_PRICE: '/custom-meal/calculate-price',
  },

  // Legacy endpoints (для совместимости)
  CUSTOM_DISH: {
    INGREDIENT_CATEGORIES: '/custom-dish/categories',
    INGREDIENTS_BY_CATEGORY: (categoryId) => `/custom-dish/categories/${categoryId}/ingredients`,
    ALL_INGREDIENTS: '/custom-dish/ingredients',
    CREATE: '/custom-dish',
    TEMPLATES: '/custom-dish/templates',
    VALIDATE: '/custom-dish/validate',
    CALCULATE_PRICE: '/custom-dish/calculate-price',
    CALCULATE_NUTRITION: '/custom-dish/calculate-nutrition',
    RECOMMENDATIONS: '/custom-dish/recommendations',
    SAVE_TEMPLATE: '/custom-dish/save-template',
  },
  
  // Orders
  ORDERS: {
    CREATE: '/orders',
    GET_BY_ID: (id) => `/orders/${id}`,
    GET_USER_ORDERS: '/orders/user',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
    CANCEL: (id) => `/orders/${id}/cancel`,
  },
  
  // Payments
  PAYMENTS: {
    CREATE: '/payments',
    VERIFY: '/payments/verify',
    WEBHOOK: '/payments/webhook',
    GET_METHODS: '/payments/methods',
    // Payment confirmation photo upload
    UPLOAD_PHOTO: '/payments/photo',
    GET_PHOTO_STATUS: (orderId) => `/payments/photo/${orderId}/status`,
    CONFIRM_PAYMENT: (orderId) => `/payments/${orderId}/confirm`,
    REJECT_PAYMENT: (orderId) => `/payments/${orderId}/reject`,
  },
  
  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    ADDRESSES: '/user/addresses',
    ADD_ADDRESS: '/user/addresses',
    UPDATE_ADDRESS: (id) => `/user/addresses/${id}`,
    DELETE_ADDRESS: (id) => `/user/addresses/${id}`,
  },
  
  // Delivery
  DELIVERY: {
    CALCULATE_COST: '/delivery/calculate',
    GET_ZONES: '/delivery/zones',
    TRACK: (id) => `/delivery/track/${id}`,
  }
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
}

// Error Types
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
}

// Custom API Error Class
export class ApiError extends Error {
  constructor(message, type, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.type = type
    this.status = status
    this.data = data
  }
}

// Error Handler
export const handleApiError = (error) => {
  if (!error.response) {
    // Network error
    return new ApiError(
      'Ошибка сети. Проверьте подключение к интернету.',
      API_ERROR_TYPES.NETWORK_ERROR,
      0
    )
  }

  const { status, data } = error.response

  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return new ApiError(
        data?.message || 'Неверные данные запроса',
        API_ERROR_TYPES.VALIDATION_ERROR,
        status,
        data
      )
    
    case HTTP_STATUS.UNAUTHORIZED:
      return new ApiError(
        data?.message || 'Необходима авторизация',
        API_ERROR_TYPES.AUTHENTICATION_ERROR,
        status,
        data
      )
    
    case HTTP_STATUS.FORBIDDEN:
      return new ApiError(
        data?.message || 'Доступ запрещен',
        API_ERROR_TYPES.AUTHORIZATION_ERROR,
        status,
        data
      )
    
    case HTTP_STATUS.NOT_FOUND:
      return new ApiError(
        data?.message || 'Ресурс не найден',
        API_ERROR_TYPES.NOT_FOUND_ERROR,
        status,
        data
      )
    
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return new ApiError(
        data?.message || 'Ошибка валидации данных',
        API_ERROR_TYPES.VALIDATION_ERROR,
        status,
        data
      )
    
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.BAD_GATEWAY:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return new ApiError(
        data?.message || 'Ошибка сервера. Попробуйте позже.',
        API_ERROR_TYPES.SERVER_ERROR,
        status,
        data
      )
    
    default:
      return new ApiError(
        data?.message || 'Произошла неизвестная ошибка',
        API_ERROR_TYPES.UNKNOWN_ERROR,
        status,
        data
      )
  }
}

// Token Management (для вашего случая - telegramUserId)
export const userDataManager = {
  getTelegramUserId: () => {
    // Сначала проверяем localStorage, потом cookies
    let telegramUserId = localStorage.getItem('telegramUserId') || getCookie('telegramUserId')
    
    // Fallback для браузерного режима - генерируем временный ID
    if (!telegramUserId) {
      // Проверяем, запущено ли приложение в Telegram Web App
      const isTelegramWebApp = window.Telegram && window.Telegram.WebApp
      
      if (isTelegramWebApp) {
        // В Telegram Web App должен быть telegramUserId
        telegramUserId = window.Telegram.WebApp.initDataUnsafe?.user?.id
      } else {
        // В браузерном режиме генерируем временный ID
        telegramUserId = `browser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        console.log('🔧 Browser mode: Generated temporary telegramUserId:', telegramUserId)
        
        // Сохраняем временный ID
        localStorage.setItem('telegramUserId', telegramUserId)
      }
    }
    
    return telegramUserId
  },
  
  getPhoneNumber: () => {
    return localStorage.getItem('phoneNumber') || getCookie('phoneNumber')
  },
  
  getName: () => {
    return localStorage.getItem('userName') || getCookie('userName')
  },
  
  setUserData: (userData, rememberMe = true) => {
    const { telegramUserId, phoneNumber, name } = userData
    
    if (rememberMe) {
      // Сохраняем в localStorage для длительного хранения
      localStorage.setItem('telegramUserId', telegramUserId?.toString() || '')
      localStorage.setItem('phoneNumber', phoneNumber || '')
      localStorage.setItem('userName', name || '')
      
      // Также в cookies с длительным сроком (30 дней)
      setCookie('telegramUserId', telegramUserId?.toString() || '', 30)
      setCookie('phoneNumber', phoneNumber || '', 30)
      setCookie('userName', name || '', 30)
    } else {
      // Только в sessionStorage для текущей сессии
      sessionStorage.setItem('telegramUserId', telegramUserId?.toString() || '')
      sessionStorage.setItem('phoneNumber', phoneNumber || '')
      sessionStorage.setItem('userName', name || '')
    }
  },
  
  clearUserData: () => {
    // Очищаем все хранилища
    localStorage.removeItem('telegramUserId')
    localStorage.removeItem('phoneNumber')
    localStorage.removeItem('userName')
    
    sessionStorage.removeItem('telegramUserId')
    sessionStorage.removeItem('phoneNumber')
    sessionStorage.removeItem('userName')
    
    deleteCookie('telegramUserId')
    deleteCookie('phoneNumber')
    deleteCookie('userName')
  },
  
  hasUserData: () => {
    return !!(userDataManager.getTelegramUserId() && userDataManager.getPhoneNumber())
  },
  
  // Проверяем, запущено ли приложение в браузерном режиме
  isBrowserMode: () => {
    return !(window.Telegram && window.Telegram.WebApp)
  }
}

// Cookie helpers
const setCookie = (name, value, days) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

const getCookie = (name) => {
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

// Request Interceptor (убираем токены, так как их нет)
export const createRequestInterceptor = (apiClient) => {
  apiClient.interceptors.request.use(
    (config) => {
      // Add common headers
      config.headers['Content-Type'] = 'application/json'
      config.headers['Accept'] = 'application/json'
      
      // Add request timestamp for logging
      config.metadata = { startTime: new Date() }
      
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      })
      
      return config
    },
    (error) => {
      console.error('[API] Request Error:', error)
      return Promise.reject(error)
    }
  )
}

// Response Interceptor (упрощенный, без refresh token)
export const createResponseInterceptor = (apiClient) => {
  apiClient.interceptors.response.use(
    (response) => {
      // Log response
      const duration = new Date() - response.config.metadata.startTime
      console.log(`[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`)
      
      return response
    },
    async (error) => {
      // Handle and transform error
      const apiError = handleApiError(error)
      console.error('[API] Response Error:', apiError)
      
      return Promise.reject(apiError)
    }
  )
} 