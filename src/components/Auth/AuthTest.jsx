import React, { useState, useEffect } from 'react'
import { 
  useIsAuthenticated, 
  useUser, 
  useAuthActions,
  useAuthLoading,
  useAuthError,
  useSavedTelegramUserId,
  useSavedPhoneNumber
} from '../../stores/authStore'
import { useNotificationActions } from '../../stores/notificationStore'

const AuthTest = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    name: '',
    telegramUserId: ''
  })
  const [isLoginMode, setIsLoginMode] = useState(true)

  // Zustand selectors
  const isAuthenticated = useIsAuthenticated()
  const user = useUser()
  const isLoading = useAuthLoading()
  const error = useAuthError()
  const savedTelegramUserId = useSavedTelegramUserId()
  const savedPhoneNumber = useSavedPhoneNumber()

  // Actions
  const authActions = useAuthActions()
  const { showSuccess, showError, showInfo } = useNotificationActions()

  // Загружаем сохраненные данные в форму
  useEffect(() => {
    if (savedPhoneNumber) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: savedPhoneNumber
      }))
    }
    if (savedTelegramUserId) {
      setFormData(prev => ({
        ...prev,
        telegramUserId: savedTelegramUserId
      }))
    }
  }, [savedPhoneNumber, savedTelegramUserId])

  // Инициализируем авторизацию при загрузке
  useEffect(() => {
    authActions.initializeAuth()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (!formData.phoneNumber || !formData.name) {
      showError('Заполните все обязательные поля')
      return
    }

    try {
      const result = await authActions.register({
        phoneNumber: formData.phoneNumber,
        name: formData.name,
        telegramUserId: formData.telegramUserId ? parseInt(formData.telegramUserId) : 0
      }, true)

      showSuccess(`Регистрация успешна! Добро пожаловать, ${result.user.name}`)
    } catch (error) {
      showError(`Ошибка регистрации: ${error.message}`)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!formData.phoneNumber) {
      showError('Введите номер телефона')
      return
    }

    try {
      const result = await authActions.login({
        phoneNumber: formData.phoneNumber,
        telegramUserId: formData.telegramUserId ? parseInt(formData.telegramUserId) : 0
      }, true)

      showSuccess(`Вход выполнен! Добро пожаловать, ${result.user.name || result.user.phoneNumber}`)
    } catch (error) {
      showError(`Ошибка входа: ${error.message}`)
    }
  }

  const handleLogout = async () => {
    try {
      await authActions.logout()
      showInfo('Вы вышли из системы')
      setFormData({
        phoneNumber: '',
        name: '',
        telegramUserId: ''
      })
    } catch (error) {
      showError(`Ошибка выхода: ${error.message}`)
    }
  }

  const handleAutoLogin = async () => {
    try {
      const success = await authActions.autoLogin()
      if (success) {
        showSuccess('Автоматический вход выполнен!')
      } else {
        showInfo('Автоматический вход не удался. Нет сохраненных данных.')
      }
    } catch (error) {
      showError(`Ошибка автоматического входа: ${error.message}`)
    }
  }

  const simulateTelegramAuth = () => {
    // Симуляция данных от Telegram WebApp
    const mockTelegramData = {
      id: Date.now(), // mock telegram user id
      phone_number: '+7 777 123 4567',
      first_name: 'Тест',
      last_name: 'Пользователь'
    }

    setFormData({
      phoneNumber: mockTelegramData.phone_number,
      name: `${mockTelegramData.first_name} ${mockTelegramData.last_name}`,
      telegramUserId: mockTelegramData.id.toString()
    })

    showInfo('Данные Telegram загружены (симуляция)')
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '500px', 
      margin: '0 auto',
      border: '1px solid #ddd',
      borderRadius: '12px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>🔐 Тест Авторизации</h2>

      {/* Показываем ошибки */}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '8px',
          marginBottom: '15px',
          color: '#c00'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Статус авторизации */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: isAuthenticated ? '#e6ffe6' : '#ffe6e6',
        border: `1px solid ${isAuthenticated ? '#4caf50' : '#f44336'}`,
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Статус: {isAuthenticated ? '✅ Авторизован' : '❌ Не авторизован'}</h3>
        {user && (
          <div>
            <p><strong>Имя:</strong> {user.name}</p>
            <p><strong>Телефон:</strong> {user.phoneNumber}</p>
            <p><strong>Telegram ID:</strong> {user.telegramUserId}</p>
          </div>
        )}
      </div>

      {!isAuthenticated ? (
        <>
          {/* Переключатель режима */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button
              onClick={() => setIsLoginMode(true)}
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                backgroundColor: isLoginMode ? '#FF6B35' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: !isLoginMode ? '#FF6B35' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Регистрация
            </button>
          </div>

          {/* Форма */}
          <form onSubmit={isLoginMode ? handleLogin : handleRegister}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Номер телефона *
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+7 777 123 4567"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            {!isLoginMode && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Имя *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ваше имя"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                  required={!isLoginMode}
                />
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Telegram User ID
              </label>
              <input
                type="number"
                name="telegramUserId"
                value={formData.telegramUserId}
                onChange={handleInputChange}
                placeholder="0 (оставьте пустым или 0)"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Загрузка...' : (isLoginMode ? 'Войти' : 'Зарегистрироваться')}
            </button>
          </form>

          {/* Дополнительные кнопки */}
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={simulateTelegramAuth}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0088cc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📱 Симулировать Telegram
            </button>
            
            <button
              onClick={handleAutoLogin}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Авто-вход
            </button>
          </div>

          {/* Сохраненные данные */}
          {(savedPhoneNumber || savedTelegramUserId) && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <strong>💾 Сохраненные данные:</strong>
              {savedPhoneNumber && <div>Телефон: {savedPhoneNumber}</div>}
              {savedTelegramUserId && <div>Telegram ID: {savedTelegramUserId}</div>}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Авторизованный пользователь */}
          <div style={{ textAlign: 'center' }}>
            <h3>🎉 Добро пожаловать!</h3>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Выйти
            </button>
          </div>
        </>
      )}

      {/* API Info */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e9ecef',
        border: '1px solid #ced4da',
        borderRadius: '8px',
        fontSize: '13px'
      }}>
        <strong>🔧 API Endpoints:</strong>
        <div>Register: POST https://backend.uyut.kr/user/register</div>
        <div>Login: POST https://backend.uyut.kr/user/login</div>
        <div>Get User: GET https://backend.uyut.kr/user/{`{telegramUserId}`}</div>
      </div>
    </div>
  )
}

export default AuthTest 