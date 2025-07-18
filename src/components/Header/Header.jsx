import React from 'react'
import { Link } from 'react-router-dom'
import { useBasket } from '../../contexts/BasketContext'
import s from './Header.module.scss'
import logo from '../../assets/icons/logo.svg'
import basket from '../../assets/icons/basket.svg'

const Header = () => {
  const { totalItems } = useBasket()

  return (
    <>
        <header className={s.header}>
            <div className="container">
                <nav className={s.header_nav}>
                    <Link to='/' className={s.header_logo}>
                        <img src={logo} alt="logo" />
                    </Link>

                    <Link to='/basket' className={s.header_basket}>
                        <img src={basket} alt="basket" />
                        {totalItems > 0 && (
                          <span className={s.header_basket__badge}>{totalItems}</span>
                        )}
                    </Link>
                </nav>
            </div>
        </header>
    </>
  )
}

export default Header