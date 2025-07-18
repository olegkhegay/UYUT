import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Типы действий для reducer
const BASKET_ACTIONS = {
  LOAD_BASKET: 'LOAD_BASKET',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_BASKET: 'CLEAR_BASKET',
  SET_EDITING_DISH: 'SET_EDITING_DISH',
  CLEAR_EDITING_DISH: 'CLEAR_EDITING_DISH'
}

// Начальное состояние
const initialState = {
  items: [],
  editingDish: null
}

// Reducer для управления состоянием корзины
const basketReducer = (state, action) => {
  switch (action.type) {
    case BASKET_ACTIONS.LOAD_BASKET:
      return {
        ...state,
        items: action.payload
      }

    case BASKET_ACTIONS.ADD_ITEM: {
      const { item } = action.payload
      const existingItemIndex = state.items.findIndex(basketItem => {
        if (item.isCustom) {
          return basketItem.isCustom && 
                 JSON.stringify(basketItem.ingredients) === JSON.stringify(item.ingredients)
        }
        return basketItem.id === item.id
      })

      if (existingItemIndex !== -1) {
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex].quantity += item.quantity || 1
        return {
          ...state,
          items: updatedItems
        }
      } else {
        return {
          ...state,
          items: [...state.items, { ...item, quantity: item.quantity || 1 }]
        }
      }
    }

    case BASKET_ACTIONS.UPDATE_QUANTITY: {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== id)
        }
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      }
    }

    case BASKET_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      }

    case BASKET_ACTIONS.CLEAR_BASKET:
      return {
        ...state,
        items: []
      }

    case BASKET_ACTIONS.SET_EDITING_DISH:
      return {
        ...state,
        editingDish: action.payload
      }

    case BASKET_ACTIONS.CLEAR_EDITING_DISH:
      return {
        ...state,
        editingDish: null
      }

    default:
      return state
  }
}

// Context
const BasketContext = createContext()

// Provider
export const BasketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(basketReducer, initialState)

  // Загружаем данные из localStorage при инициализации
  useEffect(() => {
    const savedItems = localStorage.getItem('basketItems')
    const savedEditingDish = localStorage.getItem('editingCustomDish')
    
    if (savedItems) {
      dispatch({
        type: BASKET_ACTIONS.LOAD_BASKET,
        payload: JSON.parse(savedItems)
      })
    }

    if (savedEditingDish) {
      dispatch({
        type: BASKET_ACTIONS.SET_EDITING_DISH,
        payload: JSON.parse(savedEditingDish)
      })
    }
  }, [])

  // Сохраняем в localStorage при изменении корзины
  useEffect(() => {
    localStorage.setItem('basketItems', JSON.stringify(state.items))
  }, [state.items])

  // Сохраняем редактируемое блюдо
  useEffect(() => {
    if (state.editingDish) {
      localStorage.setItem('editingCustomDish', JSON.stringify(state.editingDish))
    } else {
      localStorage.removeItem('editingCustomDish')
    }
  }, [state.editingDish])

  // Actions
  const addItem = (item) => {
    dispatch({
      type: BASKET_ACTIONS.ADD_ITEM,
      payload: { item }
    })
  }

  const updateQuantity = (id, quantity) => {
    dispatch({
      type: BASKET_ACTIONS.UPDATE_QUANTITY,
      payload: { id, quantity }
    })
  }

  const removeItem = (id) => {
    dispatch({
      type: BASKET_ACTIONS.REMOVE_ITEM,
      payload: { id }
    })
  }

  const clearBasket = () => {
    dispatch({ type: BASKET_ACTIONS.CLEAR_BASKET })
  }

  const setEditingDish = (dishData) => {
    dispatch({
      type: BASKET_ACTIONS.SET_EDITING_DISH,
      payload: dishData
    })
  }

  const clearEditingDish = () => {
    dispatch({ type: BASKET_ACTIONS.CLEAR_EDITING_DISH })
  }

  // Computed values
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const getItemQuantity = (itemId) => {
    const item = state.items.find(item => item.id === itemId)
    return item ? item.quantity : 0
  }

  const value = {
    // State
    items: state.items,
    editingDish: state.editingDish,
    
    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearBasket,
    setEditingDish,
    clearEditingDish,
    
    // Computed
    totalItems,
    totalPrice,
    getItemQuantity
  }

  return (
    <BasketContext.Provider value={value}>
      {children}
    </BasketContext.Provider>
  )
}

// Hook для использования контекста
export const useBasket = () => {
  const context = useContext(BasketContext)
  if (!context) {
    throw new Error('useBasket must be used within BasketProvider')
  }
  return context
}

export default BasketContext 