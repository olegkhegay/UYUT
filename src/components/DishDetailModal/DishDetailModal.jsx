import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBasket } from '../../contexts/BasketContext'
import MiniDishCard from './MiniDishCard'
import s from './DishDetailModal.module.scss'

const DishDetailModal = ({ dish, isOpen, onClose, allDishes = [], onOpenModal }) => {
  const { getItemQuantity, addItem, updateQuantity } = useBasket()
  const [isDragging, setIsDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [modalQuantity, setModalQuantity] = useState(1)
  const [randomizedRecommendations, setRandomizedRecommendations] = useState([])
  
  const basketQuantity = getItemQuantity(dish?.id || 0)

  // Получаем изображение с fallback
  const getImageUrl = (dishData) => {
    if (!dishData) return '/images/placeholder.png'
    
    if (dishData.imageUrl) {
      // Если это относительный путь, добавляем базовый URL
      if (dishData.imageUrl.startsWith('/')) {
        return `https://backend.uyut.kr${dishData.imageUrl}`
      }
      return dishData.imageUrl
    }
    if (dishData.image) {
      return dishData.image
    }
    return '/images/placeholder.png'
  }

  // Форматируем цену
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `${price} ₩`
    }
    return price || '0 ₩'
  }

  // Сброс количества при открытии модального окна
  useEffect(() => {
    if (isOpen && dish) {
      setModalQuantity(1)
    }
  }, [isOpen, dish])

  // Генерация рандомного порядка рекомендаций при смене блюда
  useEffect(() => {
    if (dish && allDishes.length > 0) {
      const otherDishes = allDishes.filter(d => d.id !== dish.id)
      const shuffled = [...otherDishes].sort(() => Math.random() - 0.5)
      setRandomizedRecommendations(shuffled)
    }
  }, [dish, allDishes])

  // Закрытие модалки при нажатии Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const addToBasket = () => {
    if (!dish) return
    
    if (basketQuantity === 0) {
      addItem({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        weight: dish.weight,
        image: getImageUrl(dish),
        quantity: modalQuantity
      })
    } else {
      updateQuantity(dish.id, basketQuantity + modalQuantity)
    }
  }

  const decreaseModalQuantity = () => {
    if (modalQuantity > 1) {
      setModalQuantity(modalQuantity - 1)
    }
  }

  const increaseModalQuantity = () => {
    setModalQuantity(modalQuantity + 1)
  }

  // Обработка жеста свайпа вниз
  const handleDragStart = (event, info) => {
    setIsDragging(true)
  }

  const handleDrag = (event, info) => {
    if (info.offset.y > 0) {
      setDragY(info.offset.y)
    }
  }

  const handleDragEnd = (event, info) => {
    setIsDragging(false)
    setDragY(0)
    
    // Если пользователь перетащил модалку на 1/3 высоты вниз, закрываем
    if (info.offset.y > 150) {
      onClose()
    }
  }

  // Обработчик клика на карточку рекомендации
  const handleRecommendationClick = (recommendedDish) => {
    // Закрываем текущее модальное окно и открываем новое с выбранным блюдом
    onClose()
    // Небольшая задержка для корректного закрытия/открытия
    setTimeout(() => {
      if (onOpenModal) {
        onOpenModal(recommendedDish)
      }
    }, 100)
  }

  if (!dish) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className={s.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className={s.modal}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ 
              y: isDragging ? dragY : 0,
              opacity: 1 
            }}
            exit={{ 
              y: '100%', 
              opacity: 0,
              transition: { 
                duration: 0.4, 
                ease: [0.25, 0.46, 0.45, 0.94] 
              }
            }}
            transition={{ 
              duration: isDragging ? 0 : 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 300 }}
            dragElastic={0.2}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          >
            {/* Drag Handle */}
            <div className={s.dragHandle} />
            
            {/* Close Button */}
            <button className={s.closeButton} onClick={onClose}>
              ✕
            </button>

            {/* Content */}
            <div className={s.content}>
              {/* Image */}
              <div className={s.imageContainer}>
                <img 
                  src={getImageUrl(dish)} 
                  alt={dish.name}
                  className={s.image}
                />
              </div>

              {/* Info */}
              <div className={s.info}>
                <h2 className={s.title}>{dish.name}</h2>
                <p className={s.description}>{dish.description}</p>
                
                <div className={s.priceInfo}>
                  <span className={s.weight}>{dish.weight}</span>
                  <span className={s.price}>{formatPrice(dish.price)}</span>
                </div>
              </div>

              {/* Recommendations */}
              {randomizedRecommendations.length > 0 && (
                <div className={s.recommendations}>
                  <h3 className={s.recommendationsTitle}>Рекомендации</h3>
                  <div className={s.recommendationsGrid}>
                    {randomizedRecommendations.map(recommendedDish => (
                      <MiniDishCard 
                        key={recommendedDish.id}
                        dish={recommendedDish}
                        onCardClick={handleRecommendationClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Section */}
              <div className={s.addToCartSection}>
                <div className={s.quantitySection}>
                  <div className={s.quantityControl}>
                    <button 
                      className={s.quantityButton}
                      onClick={decreaseModalQuantity}
                      disabled={modalQuantity <= 1}
                    >
                      -
                    </button>
                    <span className={s.quantityDisplay}>{modalQuantity}</span>
                    <button 
                      className={s.quantityButton}
                      onClick={increaseModalQuantity}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className={s.addToCartButton}
                    onClick={addToBasket}
                  >
                    Добавить в корзину
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default DishDetailModal 