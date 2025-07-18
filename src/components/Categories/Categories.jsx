import React, { useState, useEffect } from 'react'
import s from './Categories.module.scss'
import useMenuStore from '../../stores/menuStore'
import menuData from '../../data/menu.json'

const Categories = ({ activeCategory, onCategoryChange, disabled = false }) => {
  const [categories, setCategories] = useState([])
  
  // Подключаем MenuStore
  const { 
    categories: apiCategories, 
    loading, 
    errors, 
    loadCategories,
    currentCategory,
    setCurrentCategory 
  } = useMenuStore()

  useEffect(() => {
    // Загружаем категории при монтировании
    console.log('🔄 Categories: Component mounted, loading categories...')
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    // Формируем категории для отображения
    let displayCategories = []
    
    if (apiCategories.length > 0) {
      // Используем API данные
      const allCategories = apiCategories // Показываем все категории
      
      displayCategories = [
        { id: 'all', name: 'Все позиции', icon: '🏠', active: activeCategory === 'Все позиции' },
        ...allCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: getCategoryIcon(cat.name),
          active: cat.name === activeCategory
        }))
      ]
    } else {
      // Fallback к локальным данным
      displayCategories = menuData.categories.map(cat => ({
        ...cat,
        active: cat.name === activeCategory
      }))
    }
    
    setCategories(displayCategories)
  }, [activeCategory, apiCategories])

  // Функция для получения иконки категории
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'шаурма': '🌯',
      'закуски': '🍟',
      'напитки': '🥤',
      'десерты': '🍰',
      'супы': '🍲',
      'салаты': '🥗',
      'горячие': '🔥',
      'холодные': '❄️',
      'бургеры': '🍔',
      'пицца': '🍕'
    }

    const lowerName = categoryName.toLowerCase()
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) {
        return icon
      }
    }

    return '🍽️' // По умолчанию
  }

  const handleCategoryClick = (categoryName) => {
    if (!disabled) {
      onCategoryChange(categoryName)
      
      // Также обновляем store
      const category = apiCategories.find(cat => cat.name === categoryName)
      if (category) {
        setCurrentCategory(category.id)
      } else if (categoryName === 'Все позиции') {
        setCurrentCategory(null)
      }
    }
  }

  // Показываем ошибку если есть
  if (errors.categories) {
    return (
      <div className={`${s.categories} ${s.categories_error}`}>
        <div className={s.categories__error}>
          ⚠️ Ошибка загрузки категорий: {errors.categories}
          <button onClick={() => loadCategories(true)} className={s.categories__retry}>
            Повторить
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${s.categories} ${disabled ? s.categories_disabled : ''}`}>
      <div className={s.categories__wrapper}>
        {loading.categories && (
          <div className={s.categories__loading}>
            🔄 Загрузка категорий...
          </div>
        )}
        
        {categories.map(category => (
          <button
            key={category.id}
            className={`${s.categories__item} ${category.active ? s.categories__item_active : ''} ${disabled ? s.categories__item_disabled : ''}`}
            onClick={() => handleCategoryClick(category.name)}
            disabled={disabled || loading.categories}
          >
            <span className={s.categories__icon}>{category.icon}</span>
            <span className={s.categories__name}>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Categories