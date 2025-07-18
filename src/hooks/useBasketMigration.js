import { useEffect } from 'react'
import { useBasket } from '../contexts/BasketContext'
import { useBasketActions } from '../stores/basketStore'

// Hook для постепенной миграции с Context API на Zustand
export const useBasketMigration = () => {
  const contextBasket = useBasket()
  const zustandActions = useBasketActions()

  useEffect(() => {
    // Миграция данных из Context API в Zustand при первом использовании
    if (contextBasket.items.length > 0) {
      console.log('[Migration] Migrating basket data from Context to Zustand')
      
      // Обновляем Zustand store данными из Context
      zustandActions.updateItems(contextBasket.items)
      
      if (contextBasket.editingDish) {
        zustandActions.setEditingDish(contextBasket.editingDish)
      }
    }
  }, [contextBasket.items, contextBasket.editingDish, zustandActions])

  // Возвращаем объект с методами для совместимости
  return {
    // Геттеры остаются из Context пока не мигрированы все компоненты
    items: contextBasket.items,
    totalItems: contextBasket.totalItems,
    totalPrice: contextBasket.totalPrice,
    editingDish: contextBasket.editingDish,
    getItemQuantity: contextBasket.getItemQuantity,
    
    // Actions используем из Zustand
    addItem: zustandActions.addItem,
    updateQuantity: zustandActions.updateQuantity,
    removeItem: zustandActions.removeItem,
    clearBasket: zustandActions.clearBasket,
    setEditingDish: zustandActions.setEditingDish,
    clearEditingDish: zustandActions.clearEditingDish,
    
    // Новые методы доступны только через Zustand
    addCustomDish: zustandActions.addCustomDish,
    mergeCustomDish: zustandActions.mergeCustomDish,
    syncWithBackend: zustandActions.syncWithBackend,
    loadFromBackend: zustandActions.loadFromBackend,
  }
}

export default useBasketMigration 