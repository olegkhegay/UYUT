import React, { useEffect } from 'react'
import { 
  useBasketItems, 
  useBasketTotalPrice, 
  useBasketActions 
} from '../../stores/basketStore'
import { 
  useNotificationActions 
} from '../../stores/notificationStore'
import { 
  useIsAuthenticated, 
  useAuthActions 
} from '../../stores/authStore'

// Пример компонента, демонстрирующего использование Zustand stores
const ZustandExample = () => {
  // Zustand селекторы (автоматически перерисовываются при изменении)
  const basketItems = useBasketItems()
  const totalPrice = useBasketTotalPrice()
  const isAuthenticated = useIsAuthenticated()

  // Zustand actions
  const basketActions = useBasketActions()
  const notificationActions = useNotificationActions()
  const authActions = useAuthActions()

  // Инициализация при монтировании
  useEffect(() => {
    // Инициализируем авторизацию
    authActions.initializeAuth()
    
    // Показываем приветствие
    notificationActions.showInfo('Добро пожаловать в УЮТ!')
  }, [authActions, notificationActions])

  const handleAddTestItem = () => {
    const testItem = {
      id: Date.now(),
      name: 'Тестовая шаурма',
      price: 350,
      weight: '300г',
      image: '/images/test-dish.jpg',
      description: 'Тестовое блюдо для демонстрации',
    }

    basketActions.addItem(testItem)
    notificationActions.showSuccess(`${testItem.name} добавлена в корзину!`)
  }

  const handleClearBasket = () => {
    if (basketItems.length > 0) {
      basketActions.clearBasket()
      notificationActions.showInfo('Корзина очищена')
    } else {
      notificationActions.showWarning('Корзина уже пуста')
    }
  }

  const handleLogin = async () => {
    try {
      await authActions.login({
        email: 'test@example.com',
        password: 'test123'
      })
      notificationActions.showSuccess('Вход выполнен успешно!')
    } catch (error) {
      notificationActions.showError(`Ошибка входа: ${error.message}`)
    }
  }

  const handleLogout = async () => {
    try {
      await authActions.logout()
      notificationActions.showInfo('Вы вышли из системы')
    } catch (error) {
      notificationActions.showError(`Ошибка при выходе: ${error.message}`)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Zustand Store Demo</h2>
      
      {/* Auth Status */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Статус авторизации</h3>
        <p>Авторизован: {isAuthenticated ? '✅ Да' : '❌ Нет'}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleLogin} disabled={isAuthenticated}>
            Войти (тест)
          </button>
          <button onClick={handleLogout} disabled={!isAuthenticated}>
            Выйти
          </button>
        </div>
      </div>

      {/* Basket Status */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Состояние корзины</h3>
        <p>Товаров в корзине: {basketItems.length}</p>
        <p>Общая стоимость: {totalPrice} ₩</p>
        
        <div style={{ marginTop: '10px' }}>
          {basketItems.map((item) => (
            <div key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '5px',
              borderBottom: '1px solid #eee'
            }}>
              <span>{item.name} x{item.quantity}</span>
              <span>{item.price * item.quantity} ₩</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleAddTestItem}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#FF6B35', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Добавить тестовый товар
        </button>
        
        <button 
          onClick={handleClearBasket}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Очистить корзину
        </button>
        
        <button 
          onClick={() => notificationActions.showSuccess('Тестовое уведомление!')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Показать уведомление
        </button>
      </div>

      {/* Usage Examples */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Примеры использования</h3>
        <pre style={{ fontSize: '12px', overflowX: 'auto' }}>
{`// Использование в компонентах:

// 1. Получение данных с автоматическим перерендером
const items = useBasketItems()
const totalPrice = useBasketTotalPrice()
const isAuth = useIsAuthenticated()

// 2. Получение действий
const { addItem, removeItem } = useBasketActions()
const { showSuccess, showError } = useNotificationActions()

// 3. Вызов действий
addItem({ id: 1, name: 'Шаурма', price: 350 })
showSuccess('Товар добавлен!')`}
        </pre>
      </div>
    </div>
  )
}

export default ZustandExample 