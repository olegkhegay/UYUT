import React from 'react'
import { useBasket } from '../../contexts/BasketContext'
import s from './DishCard.module.scss'

const DishCard = ({ dish, onCardClick, onSetClick }) => {
  const { getItemQuantity, addItem, updateQuantity } = useBasket()
  
  const quantity = getItemQuantity(dish.id)

  // Получаем изображение с fallback
  const getImageUrl = () => {
    if (dish.imageUrl) {
      // Если это относительный путь, добавляем базовый URL
      if (dish.imageUrl.startsWith('/')) {
        return `https://backend.uyut.kr${dish.imageUrl}`
      }
      return dish.imageUrl
    }
    if (dish.image) {
      return dish.image
    }
    // Fallback изображение
    return '/images/placeholder.png'
  }

  // Форматируем цену
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `${price} ₩`
    }
    return price || '0 ₩'
  }

  const addToBasket = () => {
    if (quantity === 0) {
      addItem({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        weight: dish.weight,
        image: getImageUrl(),
        quantity: 1,
        isSet: dish.isSet || false,
        setItems: dish.setItems || []
      })
    } else {
      updateQuantity(dish.id, quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    updateQuantity(dish.id, quantity - 1)
  }

  const increaseQuantity = () => {
    updateQuantity(dish.id, quantity + 1)
  }

  const handleCardClick = () => {
    // Если это сет, открываем модальное окно сета
    if (dish.isSet && onSetClick) {
      onSetClick(dish)
    } else if (onCardClick) {
      onCardClick(dish)
    }
  }

  const handleButtonClick = (e) => {
    e.stopPropagation()
  }

  return (
    <div className={s.card} onClick={handleCardClick}>
      <div className={s.card__image}>
        <img src={getImageUrl()} alt={dish.name} />
        {/* Индикатор сета */}
        {dish.isSet && (
          <div className={s.card__setIndicator}>
            <span className={s.card__setLabel}>СЕТ</span>
          </div>
        )}
      </div>
      
      <div className={s.card__content}>
        <h3 className={s.card__name}>{dish.name}</h3>
        
        {/* Показываем количество блюд в сете */}
        {dish.isSet && dish.setItems && dish.setItems.length > 0 && (
          <div className={s.card__setInfo}>
            <span className={s.card__setCount}>
              {dish.setItems.length} блюд{dish.setItems.length === 1 ? 'о' : dish.setItems.length < 5 ? 'а' : ''}
            </span>
          </div>
        )}
        
        <div className={s.card__footer}>
          <div className={s.card__priceInfo}>
            {dish.weight && <span className={s.card__weight}>{dish.weight}</span>}
            <span className={s.card__price}>{formatPrice(dish.price)}</span>
          </div>
          
          {quantity === 0 ? (
            <button 
              className={s.card__button}
              onClick={(e) => {
                handleButtonClick(e)
                addToBasket()
              }}
            >
              <span>+</span>
            </button>
          ) : (
            <div className={s.card__quantityControl} onClick={handleButtonClick}>
              <button 
                className={s.card__quantityButton}
                onClick={(e) => {
                  handleButtonClick(e)
                  decreaseQuantity()
                }}
              >
                -
              </button>
              <span className={s.card__quantity}>{quantity}</span>
              <button 
                className={s.card__quantityButton}
                onClick={(e) => {
                  handleButtonClick(e)
                  increaseQuantity()
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DishCard 