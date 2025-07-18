import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBasket } from '../../contexts/BasketContext'
import { useNotification } from '../../contexts/NotificationContext'
import MiniDishCard from './MiniDishCard'
import s from './SetDetailModal.module.scss'

const SetDetailModal = ({ set, isOpen, onClose, allDishes = [] }) => {
  const { addItem, getItemQuantity } = useBasket()
  const { showNotification } = useNotification()
  const [setDishes, setSetDishes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (set && set.setItems && allDishes.length > 0) {
      // Получаем блюда из состава сета
      const dishesInSet = set.setItems.map(setItem => {
        const dish = allDishes.find(d => d.id === setItem.includedItemId)
        return dish ? {
          ...dish,
          setItemId: setItem.id,
          isReplaceable: setItem.isReplaceable,
          replacementOptions: setItem.replacementOptions || []
        } : null
      }).filter(Boolean)

      setSetDishes(dishesInSet)
      setLoading(false)
    }
  }, [set, allDishes])

  const handleAddToBasket = () => {
    if (!set) return

    addItem({
      id: set.id,
      name: set.name,
      price: set.price,
      weight: set.weight,
      image: set.imageUrl,
      quantity: 1,
      isSet: true,
      setItems: set.setItems,
      setDishes: setDishes
    })

    showNotification(`Сет "${set.name}" добавлен в корзину`, 'success')
    onClose()
  }

  const currentQuantity = set ? getItemQuantity(set.id) : 0

  if (!isOpen || !set) return null

  return (
    <AnimatePresence>
      <motion.div 
        className={s.modal}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className={s.modal__content}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={s.modal__header}>
            <div className={s.modal__setInfo}>
              <div className={s.modal__setImage}>
                <img src={set.imageUrl} alt={set.name} />
                <div className={s.modal__setIndicator}>
                  <span>СЕТ</span>
                </div>
              </div>
              
              <div className={s.modal__setDetails}>
                <h2 className={s.modal__title}>{set.name}</h2>
                {set.description && (
                  <p className={s.modal__description}>{set.description}</p>
                )}
                <div className={s.modal__priceInfo}>
                  <span className={s.modal__price}>{set.price} ₩</span>
                  <span className={s.modal__itemsCount}>
                    {setDishes.length} блюд{setDishes.length === 1 ? 'о' : setDishes.length < 5 ? 'а' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              className={s.modal__closeButton}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className={s.modal__body}>
            <h3 className={s.modal__sectionTitle}>Состав сета:</h3>
            
            {loading ? (
              <div className={s.modal__loading}>
                <div className={s.modal__spinner}></div>
                <p>Загрузка состава сета...</p>
              </div>
            ) : setDishes.length > 0 ? (
              <div className={s.modal__dishList}>
                {setDishes.map((dish, index) => (
                  <div key={dish.id || index} className={s.modal__dishItem}>
                    <MiniDishCard 
                      dish={dish}
                      showQuantity={false}
                      isInSet={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={s.modal__empty}>
                <p>Состав сета пока не определен</p>
              </div>
            )}

            {/* Информация об экономии */}
            {setDishes.length > 0 && (
              <div className={s.modal__savings}>
                <div className={s.modal__savingsCard}>
                  <h4>Выгода сета</h4>
                  <p>
                    При покупке отдельно: {setDishes.reduce((sum, dish) => sum + (dish.price || 0), 0)} ₩
                  </p>
                  <p className={s.modal__savingsAmount}>
                    Экономия: {setDishes.reduce((sum, dish) => sum + (dish.price || 0), 0) - set.price} ₩
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={s.modal__footer}>
            {currentQuantity > 0 ? (
              <div className={s.modal__quantityInfo}>
                <span>В корзине: {currentQuantity}</span>
                <button 
                  className={s.modal__addButton}
                  onClick={handleAddToBasket}
                >
                  Добавить еще
                </button>
              </div>
            ) : (
              <button 
                className={s.modal__addButton}
                onClick={handleAddToBasket}
              >
                Добавить в корзину за {set.price} ₩
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SetDetailModal 