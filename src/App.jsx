import React from 'react'
import './App.css'
import {useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AppRoutes from './routes/AppRoutes'
import { BasketProvider } from './contexts/BasketContext'
import { OrderProvider } from './contexts/OrderContext'
import { PaymentProvider } from './contexts/PaymentContext'
import { NotificationProvider } from './contexts/NotificationContext'
import GlobalNotification from './components/GlobalNotification/GlobalNotification'

const App = () => {
  const location = useLocation()
  return (
    <NotificationProvider>
      <BasketProvider>
        <OrderProvider>
          <PaymentProvider>
            <GlobalNotification />
            <AnimatePresence>
              <AppRoutes location={location} />
            </AnimatePresence>
          </PaymentProvider>
        </OrderProvider>
      </BasketProvider>
    </NotificationProvider>
  )
}

export default App