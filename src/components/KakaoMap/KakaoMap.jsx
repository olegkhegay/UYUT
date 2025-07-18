import React, { useEffect, useRef, useState } from 'react'
import s from './KakaoMap.module.scss'

const KakaoMap = ({ onLocationSelect, selectedAddress }) => {
  const mapContainer = useRef(null)
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Проверяем доступность Kakao Maps API
    if (!window.kakao || !window.kakao.maps) {
      console.warn('Kakao Maps API не найден, используется демонстрационный режим')
      setIsDemoMode(true)
      return
    }

    window.kakao.maps.load(() => {
      initializeMap()
    })
  }, [])

  const initializeMap = () => {
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780), // Сеул по умолчанию
      level: 3
    }

    const kakaoMap = new window.kakao.maps.Map(mapContainer.current, options)
    setMap(kakaoMap)

    // Создаем маркер
    const mapMarker = new window.kakao.maps.Marker({
      position: options.center,
      map: kakaoMap
    })
    setMarker(mapMarker)

    // Обработчик клика по карте
    window.kakao.maps.event.addListener(kakaoMap, 'click', (mouseEvent) => {
      const latlng = mouseEvent.latLng
      
      // Перемещаем маркер
      mapMarker.setPosition(latlng)
      
      // Получаем адрес по координатам
      getAddressFromCoords(latlng)
    })

    // Автоматически определяем текущее местоположение
    getCurrentLocation()
  }

  const getCurrentLocation = () => {
    setIsLoading(true)
    setError(null)

    if (isDemoMode) {
      // Демонстрационный режим - используем фиктивные данные
      setTimeout(() => {
        const demoLocation = {
          address: 'Сеул, Канг-нам, ул. Тэхеран-но, 123',
          lat: 37.5665,
          lng: 126.9780
        }
        setCurrentLocation(demoLocation)
        if (onLocationSelect) {
          onLocationSelect(demoLocation)
        }
        setIsLoading(false)
      }, 1000)
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          const coords = new window.kakao.maps.LatLng(lat, lng)
          
          setCurrentLocation({ lat, lng })
          
          if (map && marker) {
            map.setCenter(coords)
            marker.setPosition(coords)
            getAddressFromCoords(coords)
          }
          
          setIsLoading(false)
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error)
          setError('Не удалось получить текущее местоположение')
          setIsLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setError('Геолокация не поддерживается браузером')
      setIsLoading(false)
    }
  }

  const getAddressFromCoords = (coords) => {
    if (isDemoMode) return

    const geocoder = new window.kakao.maps.services.Geocoder()
    
    geocoder.coord2Address(coords.getLng(), coords.getLat(), (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const address = result[0].address
        const fullAddress = address.address_name
        
        if (onLocationSelect) {
          onLocationSelect({
            address: fullAddress,
            lat: coords.getLat(),
            lng: coords.getLng()
          })
        }
      }
    })
  }

  const handleMyLocationClick = () => {
    getCurrentLocation()
  }

  // Для демонстрационного режима - клик по координатам
  const handleDemoMapClick = (event) => {
    if (!isDemoMode) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Преобразуем клик в примерные координаты
    const centerLat = 37.5665
    const centerLng = 126.9780
    const mapWidth = rect.width
    const mapHeight = rect.height
    
    // Вычисляем смещение от центра карты
    const offsetX = (x - mapWidth / 2) / mapWidth * 0.02 // примерное смещение
    const offsetY = (mapHeight / 2 - y) / mapHeight * 0.02 // примерное смещение
    
    const newLat = centerLat + offsetY
    const newLng = centerLng + offsetX
    
    // Получаем адрес для данных координат (демонстрационный)
    const demoAddresses = [
      `Сеул, Канг-нам, ул. Тэхеран-но, ${Math.floor(Math.random() * 999) + 1}`,
      `Сеул, Итэвон, ул. Итэвон-но, ${Math.floor(Math.random() * 999) + 1}`,
      `Сеул, Мьонг-дон, ул. Мьонг-дон-гиль, ${Math.floor(Math.random() * 999) + 1}`,
      `Сеул, Хонг-дэ, ул. Хонг-ик-но, ${Math.floor(Math.random() * 999) + 1}`,
      `Сеул, Каннам-гу, ул. Апгуджон-но, ${Math.floor(Math.random() * 999) + 1}`,
      `Сеул, Чун-гу, ул. Чонг-но, ${Math.floor(Math.random() * 999) + 1}`
    ]

    const selectedAddress = demoAddresses[Math.floor(Math.random() * demoAddresses.length)]
    
    const demoLocation = {
      address: selectedAddress,
      lat: newLat,
      lng: newLng
    }

    if (onLocationSelect) {
      onLocationSelect(demoLocation)
    }
  }

  if (isDemoMode) {
    return (
      <div className={s.kakaoMap}>
        <div className={s.kakaoMap__container}>
          <div 
            className={s.kakaoMap__demoMap}
            onClick={handleDemoMapClick}
          >
            <div className={s.kakaoMap__demoContent}>
              <div className={s.kakaoMap__demoIcon}>🗺️</div>
              <div className={s.kakaoMap__demoText}>
                Демонстрационная карта
              </div>
              <div className={s.kakaoMap__demoSubtext}>
                Нажмите на карту для выбора адреса
              </div>
            </div>
            
            {/* Показываем маркер, если адрес выбран */}
            {selectedAddress && (
              <div className={s.kakaoMap__demoMarker}>📍</div>
            )}
          </div>
          
          <button 
            className={s.kakaoMap__myLocationBtn}
            onClick={handleMyLocationClick}
            disabled={isLoading}
            title="Моё местоположение"
          >
            {isLoading ? (
              <div className={s.kakaoMap__spinner} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>
        
        {selectedAddress && (
          <div className={s.kakaoMap__selectedAddress}>
            <div className={s.kakaoMap__addressLabel}>Выбранный адрес:</div>
            <div className={s.kakaoMap__addressText}>{selectedAddress}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={s.kakaoMap}>
      <div className={s.kakaoMap__container}>
        <div 
          ref={mapContainer} 
          className={s.kakaoMap__map}
        />
        
        <button 
          className={s.kakaoMap__myLocationBtn}
          onClick={handleMyLocationClick}
          disabled={isLoading}
          title="Моё местоположение"
        >
          {isLoading ? (
            <div className={s.kakaoMap__spinner} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="currentColor"/>
            </svg>
          )}
        </button>
        
        {error && (
          <div className={s.kakaoMap__error}>
            {error}
          </div>
        )}
      </div>
      
      {selectedAddress && (
        <div className={s.kakaoMap__selectedAddress}>
          <div className={s.kakaoMap__addressLabel}>Выбранный адрес:</div>
          <div className={s.kakaoMap__addressText}>{selectedAddress}</div>
        </div>
      )}
    </div>
  )
}

export default KakaoMap 