import React, { createContext, useContext, useReducer } from 'react'

// Типы действий для reducer
const NOTIFICATION_ACTIONS = {
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
  HIDE_NOTIFICATION: 'HIDE_NOTIFICATION'
}

// Начальное состояние
const initialState = {
  notification: null
}

// Reducer для управления состоянием уведомлений
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SHOW_NOTIFICATION:
      return {
        ...state,
        notification: action.payload
      }

    case NOTIFICATION_ACTIONS.HIDE_NOTIFICATION:
      return {
        ...state,
        notification: null
      }

    default:
      return state
  }
}

// Context
const NotificationContext = createContext()

// Provider
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  // Actions
  const showNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now().toString()
    
    dispatch({
      type: NOTIFICATION_ACTIONS.SHOW_NOTIFICATION,
      payload: {
        id,
        message,
        type, // success, error, warning, info
        duration
      }
    })

    // Автоматически скрываем уведомление через заданное время
    if (duration > 0) {
      setTimeout(() => {
        hideNotification()
      }, duration)
    }
  }

  const hideNotification = () => {
    dispatch({ type: NOTIFICATION_ACTIONS.HIDE_NOTIFICATION })
  }

  // Удобные методы для разных типов уведомлений
  const showSuccess = (message, duration = 3000) => {
    showNotification(message, 'success', duration)
  }

  const showError = (message, duration = 3000) => {
    showNotification(message, 'error', duration)
  }

  const showWarning = (message, duration = 3000) => {
    showNotification(message, 'warning', duration)
  }

  const showInfo = (message, duration = 3000) => {
    showNotification(message, 'info', duration)
  }

  // Computed values
  const hasNotification = !!state.notification

  const value = {
    // State
    notification: state.notification,
    
    // Actions
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Computed
    hasNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Hook для использования контекста
export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export default NotificationContext 