import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import s from './LoadMore.module.scss'

const LoadMore = ({ 
  onLoadMore, 
  loading = false, 
  hasMore = true, 
  error = null,
  totalLoaded = 0,
  autoLoad = true,
  threshold = 200 
}) => {
  const loadMoreRef = useRef(null)

  // Intersection Observer для автоматической загрузки
  useEffect(() => {
    if (!autoLoad || !hasMore || loading || !loadMoreRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting) {
          console.log('📄 LoadMore: Auto-loading more items')
          onLoadMore()
        }
      },
      {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    )

    observer.observe(loadMoreRef.current)

    return () => {
      observer.disconnect()
    }
  }, [autoLoad, hasMore, loading, onLoadMore, threshold])

  // Если нет больше данных для загрузки
  if (!hasMore) {
    return (
      <motion.div 
        className={s.loadMore__complete}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={s.loadMore__completeIcon}>✅</div>
        <p className={s.loadMore__completeText}>
          Все блюда загружены ({totalLoaded})
        </p>
      </motion.div>
    )
  }

  // Если есть ошибка
  if (error) {
    return (
      <motion.div 
        className={s.loadMore__error}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={s.loadMore__errorIcon}>⚠️</div>
        <p className={s.loadMore__errorText}>
          Ошибка загрузки: {error}
        </p>
        <button 
          className={s.loadMore__retryButton}
          onClick={onLoadMore}
        >
          Повторить
        </button>
      </motion.div>
    )
  }

  // Состояние загрузки
  if (loading) {
    return (
      <motion.div 
        className={s.loadMore__loading}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        ref={loadMoreRef}
      >
        <motion.div 
          className={s.loadMore__spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          🔄
        </motion.div>
        <p className={s.loadMore__loadingText}>
          Загружаем еще блюда...
        </p>
      </motion.div>
    )
  }

  // Кнопка "Загрузить еще"
  return (
    <motion.div 
      className={s.loadMore}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      ref={loadMoreRef}
    >
      {!autoLoad && (
        <motion.button
          className={s.loadMore__button}
          onClick={onLoadMore}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <span className={s.loadMore__buttonIcon}>⬇️</span>
          <span className={s.loadMore__buttonText}>
            Загрузить еще блюда
          </span>
        </motion.button>
      )}
      
      {totalLoaded > 0 && (
        <p className={s.loadMore__stats}>
          Загружено: {totalLoaded} блюд
        </p>
      )}
    </motion.div>
  )
}

export default LoadMore 