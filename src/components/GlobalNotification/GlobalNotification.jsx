import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '../../contexts/NotificationContext'
import s from './GlobalNotification.module.scss'

const GlobalNotification = () => {
  const { notification } = useNotification()

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
      default:
        return 'ℹ️'
    }
  }

  return (
    <AnimatePresence>
      {notification && (
        <motion.div 
          className={`${s.notification} ${s[`notification_${notification.type}`]}`}
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 30,
            duration: 0.3 
          }}
        >
          <span className={s.notification__icon}>
            {getIcon(notification.type)}
          </span>
          <span className={s.notification__message}>
            {notification.message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GlobalNotification 