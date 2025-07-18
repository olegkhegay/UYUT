import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import s from './Search.module.scss'
import searchIcon from '../../assets/icons/search.svg'
import useMenuStore from '../../stores/menuStore'

const Search = ({ onSearchChange, onSearchResults, searchValue = '', enableLiveSearch = true }) => {
  const [inputValue, setInputValue] = useState(searchValue)
  const [isFocused, setIsFocused] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Подключаем MenuStore
  const { 
    searchWithFilters, 
    loading, 
    errors 
  } = useMenuStore()

  useEffect(() => {
    setInputValue(searchValue)
  }, [searchValue])

  useEffect(() => {
    setIsActive(inputValue.length > 0)
  }, [inputValue])

  // Дебоунсированный поиск через API
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      if (onSearchResults) {
        onSearchResults([])
      }
      return
    }

    try {
      console.log(`🔍 Search: Performing API search for "${query}"`)
      
      const results = await searchWithFilters(query)
      
      if (onSearchResults) {
        onSearchResults(results)
      }
      
      console.log(`✅ Search: Found ${results.length} results`)
      
    } catch (error) {
      console.error('❌ Search: Failed to search:', error)
      
      if (onSearchResults) {
        onSearchResults([])
      }
    }
  }, [searchWithFilters, onSearchResults])

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)
    
    // Передаем значение поиска в родительский компонент (для совместимости)
    if (onSearchChange) {
      onSearchChange(value)
    }

    // Очищаем предыдущий таймер
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Если включен live search, делаем дебоунсированный поиск
    if (enableLiveSearch && value.trim()) {
      const timeout = setTimeout(() => {
        performSearch(value)
      }, 300) // 300ms debounce
      
      setSearchTimeout(timeout)
    } else if (!value.trim() && onSearchResults) {
      // Очищаем результаты если поле пустое
      onSearchResults([])
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const clearSearch = () => {
    setInputValue('')
    
    // Очищаем таймер поиска
    if (searchTimeout) {
      clearTimeout(searchTimeout)
      setSearchTimeout(null)
    }
    
    if (onSearchChange) {
      onSearchChange('')
    }
    
    if (onSearchResults) {
      onSearchResults([])
    }
  }

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  return (
    <motion.div 
      className={s.search}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`${s.search__wrapper} ${isFocused ? s.search__wrapper_focused : ''} ${isActive ? s.search__wrapper_active : ''} ${loading.search ? s.search__wrapper_loading : ''}`}>
        <motion.div className={s.search__iconWrapper}>
          {loading.search ? (
            <motion.div 
              className={s.search__spinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              🔄
            </motion.div>
          ) : (
            <motion.img 
              src={searchIcon} 
              alt="search" 
              className={s.search__icon}
              animate={{ 
                scale: 1
              }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.div>
        
        <input 
          type="text" 
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Найти блюдо..." 
          className={s.search__input}
          disabled={loading.search}
        />
        
        <AnimatePresence>
          {isActive && !loading.search && (
            <motion.button
              className={s.search__clear}
              onClick={clearSearch}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>
          )}
        </AnimatePresence>

        {/* Индикатор ошибки */}
        <AnimatePresence>
          {errors.search && (
            <motion.div
              className={s.search__error}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              ⚠️
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {isActive && (
          <motion.div
            className={s.search__indicator}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Search