import { useState, useEffect, useCallback } from 'react'

/**
 * Хук для кэширования и оптимизации загрузки изображений
 */
const useImageCache = () => {
  const [cache, setCache] = useState(new Map())
  const [loadingImages, setLoadingImages] = useState(new Set())

  // Предзагрузка изображения
  const preloadImage = useCallback((src) => {
    if (!src || cache.has(src) || loadingImages.has(src)) {
      return Promise.resolve(src)
    }

    return new Promise((resolve, reject) => {
      setLoadingImages(prev => new Set(prev).add(src))

      const img = new Image()
      
      img.onload = () => {
        setCache(prev => new Map(prev).set(src, 'loaded'))
        setLoadingImages(prev => {
          const newSet = new Set(prev)
          newSet.delete(src)
          return newSet
        })
        resolve(src)
      }

      img.onerror = () => {
        setCache(prev => new Map(prev).set(src, 'error'))
        setLoadingImages(prev => {
          const newSet = new Set(prev)
          newSet.delete(src)
          return newSet
        })
        reject(new Error(`Failed to load image: ${src}`))
      }

      img.src = src
    })
  }, [cache, loadingImages])

  // Предзагрузка массива изображений
  const preloadImages = useCallback(async (imageSources) => {
    const promises = imageSources
      .filter(src => src && !cache.has(src))
      .map(src => preloadImage(src).catch(() => src)) // Игнорируем ошибки отдельных изображений

    try {
      await Promise.allSettled(promises)
      console.log(`✅ ImageCache: Preloaded ${promises.length} images`)
    } catch (error) {
      console.warn('⚠️ ImageCache: Some images failed to preload:', error)
    }
  }, [preloadImage, cache])

  // Получение статуса изображения
  const getImageStatus = useCallback((src) => {
    if (loadingImages.has(src)) return 'loading'
    if (cache.has(src)) return cache.get(src)
    return 'pending'
  }, [cache, loadingImages])

  // Проверка загружено ли изображение
  const isImageLoaded = useCallback((src) => {
    return cache.get(src) === 'loaded'
  }, [cache])

  // Очистка кэша
  const clearCache = useCallback(() => {
    setCache(new Map())
    setLoadingImages(new Set())
  }, [])

  // Получение статистики кэша
  const getCacheStats = useCallback(() => {
    const loaded = Array.from(cache.values()).filter(status => status === 'loaded').length
    const errors = Array.from(cache.values()).filter(status => status === 'error').length
    const loading = loadingImages.size

    return {
      total: cache.size,
      loaded,
      errors,
      loading,
      hitRate: cache.size > 0 ? (loaded / cache.size * 100).toFixed(1) : 0
    }
  }, [cache, loadingImages])

  return {
    preloadImage,
    preloadImages,
    getImageStatus,
    isImageLoaded,
    clearCache,
    getCacheStats
  }
}

export default useImageCache 