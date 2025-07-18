import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Типы действий для reducer
const PAYMENT_ACTIONS = {
  LOAD_PAYMENT_DATA: 'LOAD_PAYMENT_DATA',
  SET_PAYMENT_METHOD: 'SET_PAYMENT_METHOD',
  SET_PAYMENT_STATE: 'SET_PAYMENT_STATE',
  SET_PAYMENT_RESULT: 'SET_PAYMENT_RESULT',
  SET_ERROR_MESSAGE: 'SET_ERROR_MESSAGE',
  CLEAR_PAYMENT_DATA: 'CLEAR_PAYMENT_DATA',
  CLEAR_PAYMENT_RESULT: 'CLEAR_PAYMENT_RESULT'
}

// Начальное состояние
const initialState = {
  selectedPaymentMethod: '',
  paymentState: 'idle', // idle, loading, success, error
  paymentResult: null,
  errorMessage: ''
}

// Reducer для управления состоянием платежей
const paymentReducer = (state, action) => {
  switch (action.type) {
    case PAYMENT_ACTIONS.LOAD_PAYMENT_DATA:
      return {
        ...state,
        paymentResult: action.payload.paymentResult
      }

    case PAYMENT_ACTIONS.SET_PAYMENT_METHOD:
      return {
        ...state,
        selectedPaymentMethod: action.payload
      }

    case PAYMENT_ACTIONS.SET_PAYMENT_STATE:
      return {
        ...state,
        paymentState: action.payload
      }

    case PAYMENT_ACTIONS.SET_PAYMENT_RESULT:
      return {
        ...state,
        paymentResult: action.payload,
        paymentState: 'success'
      }

    case PAYMENT_ACTIONS.SET_ERROR_MESSAGE:
      return {
        ...state,
        errorMessage: action.payload,
        paymentState: 'error'
      }

    case PAYMENT_ACTIONS.CLEAR_PAYMENT_DATA:
      return {
        ...state,
        selectedPaymentMethod: '',
        paymentState: 'idle',
        errorMessage: ''
      }

    case PAYMENT_ACTIONS.CLEAR_PAYMENT_RESULT:
      return {
        ...state,
        paymentResult: null
      }

    default:
      return state
  }
}

// Context
const PaymentContext = createContext()

// Provider
export const PaymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState)

  // Загружаем данные из localStorage при инициализации
  useEffect(() => {
    const savedPaymentResult = localStorage.getItem('paymentResult')
    
    if (savedPaymentResult) {
      dispatch({
        type: PAYMENT_ACTIONS.LOAD_PAYMENT_DATA,
        payload: {
          paymentResult: JSON.parse(savedPaymentResult)
        }
      })
    }
  }, [])

  // Сохраняем результат платежа в localStorage
  useEffect(() => {
    if (state.paymentResult) {
      localStorage.setItem('paymentResult', JSON.stringify(state.paymentResult))
    } else {
      localStorage.removeItem('paymentResult')
    }
  }, [state.paymentResult])

  // Actions
  const setPaymentMethod = (method) => {
    dispatch({
      type: PAYMENT_ACTIONS.SET_PAYMENT_METHOD,
      payload: method
    })
  }

  const setPaymentState = (state) => {
    dispatch({
      type: PAYMENT_ACTIONS.SET_PAYMENT_STATE,
      payload: state
    })
  }

  const setPaymentResult = (result) => {
    dispatch({
      type: PAYMENT_ACTIONS.SET_PAYMENT_RESULT,
      payload: result
    })
  }

  const setErrorMessage = (message) => {
    dispatch({
      type: PAYMENT_ACTIONS.SET_ERROR_MESSAGE,
      payload: message
    })
  }

  const clearPaymentData = () => {
    dispatch({ type: PAYMENT_ACTIONS.CLEAR_PAYMENT_DATA })
  }

  const clearPaymentResult = () => {
    dispatch({ type: PAYMENT_ACTIONS.CLEAR_PAYMENT_RESULT })
  }

  // Computed values
  const isLoading = state.paymentState === 'loading'
  const isSuccess = state.paymentState === 'success'
  const isError = state.paymentState === 'error'
  const hasPaymentResult = !!state.paymentResult

  const value = {
    // State
    selectedPaymentMethod: state.selectedPaymentMethod,
    paymentState: state.paymentState,
    paymentResult: state.paymentResult,
    errorMessage: state.errorMessage,
    
    // Actions
    setPaymentMethod,
    setPaymentState,
    setPaymentResult,
    setErrorMessage,
    clearPaymentData,
    clearPaymentResult,
    
    // Computed
    isLoading,
    isSuccess,
    isError,
    hasPaymentResult
  }

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  )
}

// Hook для использования контекста
export const usePayment = () => {
  const context = useContext(PaymentContext)
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider')
  }
  return context
}

export default PaymentContext 