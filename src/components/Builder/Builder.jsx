import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import s from './Builder.module.scss'

const Builder = () => {
  return (
    <motion.div 
      className={s.builder}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={s.builder__content}>
        <h2 className={s.builder__title}>
          Собери своё идеальное блюдо
        </h2>
        
        <div className={s.builder__main}>
          <div className={s.builder__text}>
            <p className={s.builder__description}>
              Выбирай ингредиенты и создавай свое любимое блюдо
            </p>
            <p className={s.builder__subtitle}>
              Вкус без ограничений!
            </p>
          </div>
          
          <div className={s.builder__image}>
            <img 
              src="/images/build.png" 
              alt="Собери своё блюдо" 
              className={s.builder__img}
            />
            <Link to="/customdish" className={s.builder__button}>
              <img src="/images/arrow.png" alt="arrow" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Builder
