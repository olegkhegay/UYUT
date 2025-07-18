import React, { createContext, useContext, useReducer, useEffect } from 'react'
import signalRService from '../services/signalRService'

// Типы действий для reducer
const ORDER_ACTIONS = {
  LOAD_ORDER: 'LOAD_ORDER',
  SET_ORDER_DATA: 'SET_ORDER_DATA',
  SET_USER_DATA: 'SET_USER_DATA',
  SET_DELIVERY_DATA: 'SET_DELIVERY_DATA',
  SET_ORDER_FOR_PAYMENT: 'SET_ORDER_FOR_PAYMENT',
  CLEAR_ORDER: 'CLEAR_ORDER',
  CLEAR_ORDER_FOR_PAYMENT: 'CLEAR_ORDER_FOR_PAYMENT',
  // SignalR payment events
  SET_PAYMENT_STATUS: 'SET_PAYMENT_STATUS',
  SET_PAYMENT_PHOTO: 'SET_PAYMENT_PHOTO',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  SET_ADMIN_NOTIFICATION: 'SET_ADMIN_NOTIFICATION'
}

// Начальное состояние
const initialState = {
  currentOrder: null,
  orderForPayment: null,
  // SignalR payment state
  paymentStatus: null,
  paymentPhoto: null,
  adminNotifications: []
}

// Reducer для управления состоянием заказов
const orderReducer = (state, action) => {
  switch (action.type) {
    case ORDER_ACTIONS.LOAD_ORDER:
      return {
        ...state,
        currentOrder: action.payload.currentOrder,
        orderForPayment: action.payload.orderForPayment
      }

    case ORDER_ACTIONS.SET_ORDER_DATA:
      return {
        ...state,
        currentOrder: action.payload
      }

    case ORDER_ACTIONS.SET_USER_DATA:
      return {
        ...state,
        currentOrder: state.currentOrder ? {
          ...state.currentOrder,
          user: action.payload
        } : null
      }

    case ORDER_ACTIONS.SET_DELIVERY_DATA:
      return {
        ...state,
        currentOrder: state.currentOrder ? {
          ...state.currentOrder,
          deliveryMethod: action.payload.deliveryMethod,
          address: action.payload.address,
          selectedLocation: action.payload.selectedLocation,
          comment: action.payload.comment,
          apartmentInfo: action.payload.apartmentInfo,
          intercom: action.payload.intercom,
          deliveryPrice: action.payload.deliveryPrice,
          totalWithDelivery: action.payload.totalWithDelivery
        } : null
      }

    case ORDER_ACTIONS.SET_ORDER_FOR_PAYMENT:
      return {
        ...state,
        orderForPayment: action.payload
      }

    case ORDER_ACTIONS.CLEAR_ORDER:
      return {
        ...state,
        currentOrder: null
      }

    case ORDER_ACTIONS.CLEAR_ORDER_FOR_PAYMENT:
      return {
        ...state,
        orderForPayment: null
      }

    case ORDER_ACTIONS.SET_PAYMENT_STATUS:
      return {
        ...state,
        paymentStatus: action.payload
      }

    case ORDER_ACTIONS.SET_PAYMENT_PHOTO:
      return {
        ...state,
        paymentPhoto: action.payload
      }

    case ORDER_ACTIONS.UPDATE_ORDER_STATUS:
      return {
        ...state,
        currentOrder: state.currentOrder ? {
          ...state.currentOrder,
          status: action.payload.status
        } : null,
        orderForPayment: state.orderForPayment ? {
          ...state.orderForPayment,
          status: action.payload.status
        } : null
      }

    case ORDER_ACTIONS.SET_ADMIN_NOTIFICATION:
      return {
        ...state,
        adminNotifications: [...state.adminNotifications, action.payload]
      }

    default:
      return state
  }
}

// Context
const OrderContext = createContext()

// Provider
export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState)

  // Загружаем данные из localStorage при инициализации
  useEffect(() => {
    const savedCurrentOrder = localStorage.getItem('currentOrder')
    const savedOrderForPayment = localStorage.getItem('orderForPayment')
    
    dispatch({
      type: ORDER_ACTIONS.LOAD_ORDER,
      payload: {
        currentOrder: savedCurrentOrder ? JSON.parse(savedCurrentOrder) : null,
        orderForPayment: savedOrderForPayment ? JSON.parse(savedOrderForPayment) : null
      }
    })
  }, [])

  // Сохраняем текущий заказ в localStorage
  useEffect(() => {
    if (state.currentOrder) {
      localStorage.setItem('currentOrder', JSON.stringify(state.currentOrder))
    } else {
      localStorage.removeItem('currentOrder')
    }
  }, [state.currentOrder])

  // Сохраняем заказ для оплаты в localStorage
  useEffect(() => {
    if (state.orderForPayment) {
      localStorage.setItem('orderForPayment', JSON.stringify(state.orderForPayment))
    } else {
      localStorage.removeItem('orderForPayment')
    }
  }, [state.orderForPayment])

  // Инициализация SignalR подключения и подписка на события
  useEffect(() => {
    const initializeSignalR = async () => {
      try {
        console.log('🔄 OrderContext: Initializing SignalR connection...')
        const success = await signalRService.initializeConnection()
        
        if (!success) {
          console.warn('⚠️ OrderContext: SignalR connection failed, continuing without real-time updates')
          return
        }
        
        // Подписываемся на события SignalR
        signalRService.on('paymentConfirmationRequested', (data) => {
          dispatch({
            type: ORDER_ACTIONS.SET_PAYMENT_STATUS,
            payload: { status: 'requested', ...data }
          })
        })

        signalRService.on('paymentConfirmed', (data) => {
          dispatch({
            type: ORDER_ACTIONS.SET_PAYMENT_STATUS,
            payload: { status: 'confirmed', ...data }
          })
          dispatch({
            type: ORDER_ACTIONS.UPDATE_ORDER_STATUS,
            payload: { status: 'paid' }
          })
        })

        signalRService.on('paymentRejected', (data) => {
          dispatch({
            type: ORDER_ACTIONS.SET_PAYMENT_STATUS,
            payload: { status: 'rejected', ...data }
          })
        })

        signalRService.on('orderStatusUpdated', (data) => {
          dispatch({
            type: ORDER_ACTIONS.UPDATE_ORDER_STATUS,
            payload: data
          })
        })

        signalRService.on('adminNotification', (data) => {
          dispatch({
            type: ORDER_ACTIONS.SET_ADMIN_NOTIFICATION,
            payload: data
          })
        })

        console.log('✅ OrderContext: SignalR connection established successfully')

      } catch (error) {
        console.error('❌ OrderContext: SignalR initialization error:', error)
        console.log('ℹ️ OrderContext: Continuing without SignalR - real-time updates disabled')
      }
    }

    // Запускаем инициализацию асинхронно, не блокируя рендер
    initializeSignalR()

    // Очистка при размонтировании
    return () => {
      try {
        signalRService.disconnect()
      } catch (error) {
        console.warn('⚠️ OrderContext: Error disconnecting SignalR:', error)
      }
    }
  }, [])

  // Actions
  const createOrder = (orderData) => {
    dispatch({
      type: ORDER_ACTIONS.SET_ORDER_DATA,
      payload: orderData
    })
  }

  const updateUserData = (userData) => {
    dispatch({
      type: ORDER_ACTIONS.SET_USER_DATA,
      payload: userData
    })
  }

  const updateDeliveryData = (deliveryData) => {
    dispatch({
      type: ORDER_ACTIONS.SET_DELIVERY_DATA,
      payload: deliveryData
    })
  }

  const setOrderForPayment = (orderData) => {
    dispatch({
      type: ORDER_ACTIONS.SET_ORDER_FOR_PAYMENT,
      payload: orderData
    })
  }

  const clearOrder = () => {
    dispatch({ type: ORDER_ACTIONS.CLEAR_ORDER })
  }

  const clearOrderForPayment = () => {
    dispatch({ type: ORDER_ACTIONS.CLEAR_ORDER_FOR_PAYMENT })
  }

  const clearAllOrders = () => {
    dispatch({ type: ORDER_ACTIONS.CLEAR_ORDER })
    dispatch({ type: ORDER_ACTIONS.CLEAR_ORDER_FOR_PAYMENT })
  }

  // SignalR payment actions
  const setPaymentStatus = (status) => {
    dispatch({
      type: ORDER_ACTIONS.SET_PAYMENT_STATUS,
      payload: status
    })
  }

  const setPaymentPhoto = (photo) => {
    dispatch({
      type: ORDER_ACTIONS.SET_PAYMENT_PHOTO,
      payload: photo
    })
  }

  const clearAdminNotifications = () => {
    dispatch({
      type: ORDER_ACTIONS.SET_ADMIN_NOTIFICATION,
      payload: []
    })
  }

  // Computed values
  const hasCurrentOrder = !!state.currentOrder
  const hasOrderForPayment = !!state.orderForPayment

  const value = {
    // State
    currentOrder: state.currentOrder,
    orderForPayment: state.orderForPayment,
    paymentStatus: state.paymentStatus,
    paymentPhoto: state.paymentPhoto,
    adminNotifications: state.adminNotifications,
    
    // Actions
    createOrder,
    updateUserData,
    updateDeliveryData,
    setOrderForPayment,
    clearOrder,
    clearOrderForPayment,
    clearAllOrders,
    setPaymentStatus,
    setPaymentPhoto,
    clearAdminNotifications,
    
    // Computed
    hasCurrentOrder,
    hasOrderForPayment
  }

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  )
}

// Hook для использования контекста
export const useOrder = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider')
  }
  return context
}

export default OrderContext 