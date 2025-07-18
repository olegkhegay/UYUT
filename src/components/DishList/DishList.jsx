import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import s from './DishList.module.scss'
import DishCard from '../DishCard/DishCard'
import DishDetailModal from '../DishDetailModal/DishDetailModal'
import useMenuStore from '../../stores/menuStore'
import { API_TYPES } from '../../api/types'
import menuData from '../../data/menu.json'

const DishList = forwardRef(({ 
  activeCategory = 'Все позиции', 
  searchQuery = '', 
  onCategoryChange,
  onSetClick,
  onAllDishesLoad
}, ref) => {
  const [filteredDishes, setFilteredDishes] = useState([])
  const [selectedDish, setSelectedDish] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const categoryRefs = useRef({})

  // Подключаем MenuStore
  const { 
    categories,
    dishes,
    loading,
    errors,
    searchDishes,
    getDishesByCategory,
    currentCategory 
  } = useMenuStore()

  // Отладка данных из store
  useEffect(() => {
    console.log('🔄 DishList: Store data received:')
    console.log('📊 DishList: categories:', categories)
    console.log('📊 DishList: categories length:', categories?.length || 0)
    console.log('📊 DishList: dishes:', dishes)
    console.log('📊 DishList: dishes length:', dishes?.length || 0)
    console.log('📊 DishList: loading:', loading)
    console.log('📊 DishList: errors:', errors)
  }, [categories, dishes, loading, errors])

  // Fallback к локальным данным если API недоступен - мемоизируем
  const fallbackDishes = useMemo(() => 
    dishes.length > 0 ? dishes : menuData.dishes, 
    [dishes]
  )

  // Получаем все блюда из всех категорий (включая сеты) - мемоизируем
  const allDishes = useMemo(() => {
    console.log('🔄 DishList: Processing categories:', categories)
    
    const dishes = categories.reduce((acc, category) => {
      if (category.menuItems && category.menuItems.length > 0) {
        const categoryDishes = category.menuItems.map(dish => ({
          ...dish,
          categoryName: category.name,
          categoryId: category.id
        }))
        console.log(`📦 DishList: Category "${category.name}" has ${categoryDishes.length} dishes`)
        return [...acc, ...categoryDishes]
      }
      return acc
    }, [])
    
    console.log(`✅ DishList: Total dishes from categories: ${dishes.length}`)
    return dishes
  }, [categories])

  // Передаем все блюда в родительский компонент для использования в SetDetailModal
  useEffect(() => {
    if (onAllDishesLoad && allDishes.length > 0) {
      onAllDishesLoad(allDishes)
    }
  }, [allDishes, onAllDishesLoad])

  // Мемоизируем функцию поиска
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setFilteredDishes([])
      return
    }

    try {
      // Используем поиск из store
      const results = await searchDishes(query)
      setFilteredDishes(results)
    } catch (error) {
      console.warn('API search failed, using local search:', error)
      // Fallback поиск по локальным данным (включая сеты)
      const filtered = allDishes.filter(dish => 
        dish.name.toLowerCase().includes(query.toLowerCase()) ||
        dish.description.toLowerCase().includes(query.toLowerCase()) ||
        (dish.categoryName || dish.category || '').toLowerCase().includes(query.toLowerCase())
      )
      setFilteredDishes(filtered)
    }
  }, [searchDishes, allDishes])

  useEffect(() => {
    performSearch(searchQuery)
  }, [searchQuery, performSearch])

  // Группируем блюда по категориям - мемоизируем
  const groupedDishes = useMemo(() => {
    console.log('🔄 DishList: Grouping dishes by categories')
    
    if (categories.length > 0) {
      // Используем API данные
      const grouped = categories.reduce((acc, category) => {
        if (category.menuItems && category.menuItems.length > 0) {
          acc[category.name] = category.menuItems.map(dish => ({
            ...dish,
            // Добавляем недостающие поля для совместимости
            category: category.name,
            categoryName: category.name,
            // Конвертируем цену для отображения
            displayPrice: API_TYPES.formatPrice(dish.price)
          }))
          console.log(`📦 DishList: Grouped ${acc[category.name].length} dishes for category "${category.name}"`)
        }
        return acc
      }, {})
      
      console.log('✅ DishList: Grouped dishes:', Object.keys(grouped))
      return grouped
    } else {
      // Fallback к локальным данным
      console.log('🔄 DishList: Using fallback local data')
      return menuData.dishes.reduce((acc, dish) => {
        const categoryName = menuData.categories.find(cat => cat.id === dish.category)?.name || 'Другое'
        if (!acc[categoryName]) {
          acc[categoryName] = []
        }
        acc[categoryName].push({
          ...dish,
          displayPrice: dish.price,
          categoryName
        })
        return acc
      }, {})
    }
  }, [categories])

  const scrollToCategory = (categoryName) => {
    if (categoryName === 'Все позиции') {
      // Скролл к началу списка
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (categoryRefs.current[categoryName]) {
      const element = categoryRefs.current[categoryName]
      const elementPosition = element.offsetTop
      
      // Проверяем, находятся ли categories в sticky состоянии
      const searchElement = document.querySelector('[class*="home__search"]')
      const searchBottom = searchElement ? searchElement.offsetTop + searchElement.offsetHeight : 0
      const isSticky = window.pageYOffset >= searchBottom
      
      const offsetPosition = elementPosition - (isSticky ? 80 : 20)
      
      window.scrollTo({ 
        top: offsetPosition, 
        behavior: 'smooth' 
      })
    }
  }

  const handleCardClick = (dish) => {
    setSelectedDish(dish)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedDish(null)
  }

  useImperativeHandle(ref, () => ({
    scrollToCategory
  }))

  // Показываем ошибки если есть
  if (errors.categories) {
    return (
      <div className={s.dishList}>
        <div className={s.dishList__error}>
          <div className={s.dishList__errorIcon}>⚠️</div>
          <h3 className={s.dishList__errorTitle}>Ошибка загрузки меню</h3>
          <p className={s.dishList__errorText}>{errors.categories}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={s.dishList__errorButton}
          >
            Обновить страницу
          </button>
        </div>
      </div>
    )
  }

  // Показываем загрузку
  if (loading.categories && categories.length === 0) {
    return (
      <div className={s.dishList}>
        <div className={s.dishList__loading}>
          <div className={s.dishList__loadingIcon}>🔄</div>
          <h3 className={s.dishList__loadingTitle}>Загружаем меню...</h3>
          <p className={s.dishList__loadingText}>Пожалуйста, подождите</p>
        </div>
      </div>
    )
  }

  // Если есть поисковый запрос, показываем результаты поиска
  if (searchQuery.trim()) {
    return (
      <div className={s.dishList}>
        <motion.div 
          className={s.dishList__searchResults}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={s.dishList__searchHeader}>
            <h2 className={s.dishList__searchTitle}>
              Результаты поиска "{searchQuery}"
            </h2>
            <span className={s.dishList__searchCount}>
              {loading.search ? 'Поиск...' : `${filteredDishes.length} ${filteredDishes.length === 1 ? 'результат' : 'результатов'}`}
            </span>
          </div>
          
          <AnimatePresence mode="wait">
            {filteredDishes.length > 0 ? (
              <motion.div 
                className={s.dishList__grid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredDishes.map((dish, index) => (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <DishCard 
                      dish={dish} 
                      onCardClick={handleCardClick}
                      onSetClick={onSetClick}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className={s.dishList__noResults}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className={s.dishList__noResultsIcon}>🔍</div>
                <h3 className={s.dishList__noResultsTitle}>Ничего не найдено</h3>
                <p className={s.dishList__noResultsText}>
                  Попробуйте изменить поисковый запрос или выберить другую категорию
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <DishDetailModal
          dish={selectedDish}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          allDishes={fallbackDishes}
          onOpenModal={handleCardClick}
        />
      </div>
    )
  }

  // Обычное отображение по категориям
  return (
    <>
      <div className={s.dishList}>
        {Object.entries(groupedDishes).length > 0 ? (
          Object.entries(groupedDishes).map(([category, categoryDishes]) => (
            <div key={category} className={s.dishList__category}>
              <h2 
                className={s.dishList__categoryTitle}
                ref={el => categoryRefs.current[category] = el}
              >
                {category}
              </h2>
              <div className={s.dishList__grid}>
                {categoryDishes.map(dish => (
                  <DishCard 
                    key={dish.id} 
                    dish={dish} 
                    onCardClick={handleCardClick}
                    onSetClick={onSetClick}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className={s.dishList__empty}>
            <div className={s.dishList__emptyIcon}>🍽️</div>
            <h3 className={s.dishList__emptyTitle}>Меню пусто</h3>
            <p className={s.dishList__emptyText}>
              {loading.categories ? 'Загружаем меню...' : 'В данный момент меню недоступно'}
            </p>
            {!loading.categories && (
              <button 
                onClick={() => window.location.reload()} 
                className={s.dishList__emptyButton}
              >
                Обновить страницу
              </button>
            )}
          </div>
        )}
      </div>
      
      <DishDetailModal
        dish={selectedDish}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        allDishes={fallbackDishes}
        onOpenModal={handleCardClick}
      />
    </>
  )
})

export default DishList 