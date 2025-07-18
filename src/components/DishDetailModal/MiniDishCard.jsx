import React from 'react'
import { useBasket } from '../../contexts/BasketContext'
import s from './MiniDishCard.module.scss'

const MiniDishCard = ({ dish, onCardClick, showQuantity = true, isInSet = false }) => {
  const { getItemQuantity, addItem, updateQuantity } = useBasket()
  
  const quantity = getItemQuantity(dish.id)

  const addToBasket = () => {
    if (quantity === 0) {
      addItem({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        weight: dish.weight,
        image: dish.imageUrl || dish.image,
        quantity: 1
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
    // Если это элемент сета, не вызываем клик
    if (!isInSet && onCardClick) {
      onCardClick(dish)
    }
  }

  const handleButtonClick = (e) => {
    e.stopPropagation()
  }

  return (
    <div className={`${s.miniCard} ${isInSet ? s.miniCard__inSet : ''}`} onClick={handleCardClick}>
      <div className={s.miniCard__image}>
        <img src={dish.imageUrl || dish.image} alt={dish.name} />
      </div>
      
      <div className={s.miniCard__content}>
        <h4 className={s.miniCard__name}>{dish.name}</h4>
        {dish.description && (
          <p className={s.miniCard__description}>{dish.description}</p>
        )}
        
        <div className={s.miniCard__footer}>
          <div className={s.miniCard__priceInfo}>
            {dish.weight && <span className={s.miniCard__weight}>{dish.weight}</span>}
            <span className={s.miniCard__price}>{dish.price} ₩</span>
          </div>
          
          {/* Показываем контролы количества только если не в сете и showQuantity true */}
          {!isInSet && showQuantity && (
            <>
              {quantity === 0 ? (
                <button 
                  className={s.miniCard__button}
                  onClick={(e) => {
                    handleButtonClick(e)
                    addToBasket()
                  }}
                >
                  <span>+</span>
                </button>
              ) : (
                <div className={s.miniCard__quantityControl} onClick={handleButtonClick}>
                  <button 
                    className={s.miniCard__quantityButton}
                    onClick={(e) => {
                      handleButtonClick(e)
                      decreaseQuantity()
                    }}
                  >
                    -
                  </button>
                  <span className={s.miniCard__quantity}>{quantity}</span>
                  <button 
                    className={s.miniCard__quantityButton}
                    onClick={(e) => {
                      handleButtonClick(e)
                      increaseQuantity()
                    }}
                  >
                    +
                  </button>
                </div>
              )}
            </>
          )}

          {/* Если это элемент сета, показываем индикатор */}
          {isInSet && (
            <div className={s.miniCard__setIndicator}>
              <span>В составе сета</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MiniDishCard 