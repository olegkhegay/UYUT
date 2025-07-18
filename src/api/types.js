/**
 * @typedef {Object} MenuItem
 * @property {string} id - Уникальный ID блюда
 * @property {string} name - Название блюда
 * @property {string} imageUrl - URL изображения
 * @property {string} description - Описание блюда
 * @property {number} price - Цена в копейках (например, 11000 = 110.00)
 * @property {boolean} isSet - Является ли комбо-набором
 * @property {string} categoryId - ID категории
 * @property {MenuItem[]|null} setItems - Элементы набора (если isSet = true)
 */

/**
 * @typedef {Object} Ingredient
 * @property {string} id - Уникальный ID ингредиента
 * @property {string} name - Название ингредиента
 * @property {string} [imageUrl] - URL изображения ингредиента
 * @property {number} [price] - Дополнительная стоимость
 * @property {boolean} [isRequired] - Обязательный ингредиент
 */

/**
 * @typedef {Object} Category
 * @property {string} id - Уникальный ID категории
 * @property {string} name - Название категории
 * @property {number} categoryFor - Тип категории (0 = обычное меню)
 * @property {MenuItem[]} menuItems - Список блюд в категории
 * @property {Ingredient[]} ingredients - Список доступных ингредиентов
 */

/**
 * @typedef {Category[]} CategoriesResponse
 */

/**
 * @typedef {MenuItem[]} MenuItemsResponse
 */

/**
 * @typedef {Object} MenuItemsQuery
 * @property {string} [search] - Поисковый запрос по названию и описанию
 * @property {string} [categoryId] - Фильтр по ID категории
 * @property {boolean} [isSet] - Фильтр по типу (наборы или отдельные блюда)
 * @property {number} [minPrice] - Минимальная цена в копейках
 * @property {number} [maxPrice] - Максимальная цена в копейках
 * @property {number} [page] - Номер страницы для пагинации
 * @property {number} [limit] - Количество элементов на странице
 * @property {string} [sortBy] - Поле для сортировки (name, price, categoryId)
 * @property {string} [sortOrder] - Порядок сортировки (asc, desc)
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - Сообщение об ошибке
 * @property {number} status - HTTP статус код
 * @property {string} [details] - Дополнительные детали
 * @property {number} timestamp - Время возникновения ошибки
 */

/**
 * @typedef {Object} ApiResponse
 * @template T
 * @property {T} data - Данные ответа
 * @property {boolean} success - Успешность операции
 * @property {string} [message] - Сообщение
 * @property {ApiError} [error] - Информация об ошибке
 */

/**
 * @typedef {Object} CustomDishIngredient
 * @property {string} id - Уникальный ID ингредиента
 * @property {string} name - Название ингредиента
 * @property {number} price - Цена в копейках
 * @property {number} weight - Вес в граммах
 * @property {string} image - URL изображения
 * @property {string} [description] - Описание ингредиента
 * @property {boolean} [isAvailable] - Доступность ингредиента
 * @property {string} [allergens] - Аллергены
 * @property {number} [calories] - Калории на 100г
 * @property {Object} [nutrition] - Пищевая ценность
 */

/**
 * @typedef {Object} CustomDishCategory
 * @property {string} id - Уникальный ID категории
 * @property {string} name - Название категории
 * @property {number} maxSelection - Максимальное количество выборов
 * @property {boolean} required - Обязательна ли категория
 * @property {string} [icon] - Иконка категории
 * @property {string} [description] - Описание категории
 * @property {CustomDishIngredient[]} items - Список ингредиентов
 * @property {number} [minSelection] - Минимальное количество выборов
 * @property {boolean} [allowMultiple] - Разрешить выбор нескольких из одной категории
 */

/**
 * @typedef {Object} SelectedIngredient
 * @property {CustomDishIngredient} ingredient - Ингредиент
 * @property {number} quantity - Количество
 * @property {string} categoryId - ID категории
 * @property {number} [customPrice] - Кастомная цена (если есть)
 * @property {string} [notes] - Заметки к ингредиенту
 */

/**
 * @typedef {Object} CustomDish
 * @property {string} id - Уникальный ID кастомного блюда
 * @property {string} name - Название блюда
 * @property {SelectedIngredient[]} ingredients - Выбранные ингредиенты
 * @property {number} totalPrice - Общая стоимость
 * @property {number} totalWeight - Общий вес
 * @property {number} totalCalories - Общая калорийность
 * @property {string} [notes] - Особые пожелания
 * @property {string} createdAt - Дата создания
 * @property {string} [imageUrl] - URL изображения готового блюда
 */

/**
 * @typedef {Object} CustomDishValidation
 * @property {boolean} isValid - Валидно ли блюдо
 * @property {string[]} errors - Список ошибок
 * @property {string[]} warnings - Список предупреждений
 * @property {number} completeness - Процент завершенности (0-100)
 */

/**
 * @typedef {Object} CustomDishTemplate
 * @property {string} id - ID шаблона
 * @property {string} name - Название шаблона
 * @property {string} description - Описание
 * @property {SelectedIngredient[]} defaultIngredients - Ингредиенты по умолчанию
 * @property {string} category - Категория шаблона
 * @property {string} imageUrl - Изображение шаблона
 * @property {boolean} isPopular - Популярный шаблон
 */

/**
 * @typedef {CustomDishCategory[]} CustomDishCategoriesResponse
 */

export const API_TYPES = {
  // Константы для типов категорий
  CATEGORY_TYPES: {
    MENU: 0,
    DRINKS: 1,
    DESSERTS: 2
  },
  
  // Валидация данных
  validateMenuItem: (item) => {
    const required = ['id', 'name', 'imageUrl', 'description', 'price', 'categoryId'];
    return required.every(field => item && typeof item[field] !== 'undefined');
  },
  
  validateCategory: (category) => {
    const required = ['id', 'name', 'categoryFor', 'menuItems', 'ingredients'];
    return required.every(field => category && typeof category[field] !== 'undefined');
  },
  
  // Утилиты для работы с ценами
  formatPrice: (priceInKopecks) => {
    return (priceInKopecks / 100).toFixed(2);
  },
  
  parsePrice: (priceString) => {
    return Math.round(parseFloat(priceString) * 100);
  },
  
  // Утилиты для работы с query параметрами
  buildMenuItemsQuery: (params = {}) => {
    const query = new URLSearchParams()
    
    if (params.search?.trim()) {
      query.append('search', params.search.trim())
    }
    
    if (params.categoryId) {
      query.append('categoryId', params.categoryId)
    }
    
    if (typeof params.isSet === 'boolean') {
      query.append('isSet', params.isSet.toString())
    }
    
    if (typeof params.minPrice === 'number' && params.minPrice >= 0) {
      query.append('minPrice', params.minPrice.toString())
    }
    
    if (typeof params.maxPrice === 'number' && params.maxPrice >= 0) {
      query.append('maxPrice', params.maxPrice.toString())
    }
    
    if (typeof params.page === 'number' && params.page > 0) {
      query.append('page', params.page.toString())
    }
    
    if (typeof params.limit === 'number' && params.limit > 0) {
      query.append('limit', params.limit.toString())
    }
    
    if (params.sortBy && ['name', 'price', 'categoryId'].includes(params.sortBy)) {
      query.append('sortBy', params.sortBy)
    }
    
    if (params.sortOrder && ['asc', 'desc'].includes(params.sortOrder)) {
      query.append('sortOrder', params.sortOrder)
    }
    
    return query.toString()
  },
  
  // Создание пустого объекта запроса с дефолтными значениями
  createDefaultQuery: () => ({
    search: '',
    categoryId: null,
    isSet: null,
    minPrice: null,
    maxPrice: null,
    page: 1,
    limit: 50,
    sortBy: 'name',
    sortOrder: 'asc'
  }),

  // Утилиты для работы с кастомными блюдами
  validateCustomDishIngredient: (ingredient) => {
    const required = ['id', 'name', 'price', 'weight', 'image']
    return required.every(field => 
      ingredient && 
      typeof ingredient[field] !== 'undefined' && 
      ingredient[field] !== null
    )
  },

  validateCustomDishCategory: (category) => {
    const required = ['id', 'name', 'maxSelection', 'required', 'items']
    const isValidStructure = required.every(field => 
      category && 
      typeof category[field] !== 'undefined' && 
      category[field] !== null
    )
    
    const hasValidItems = Array.isArray(category.items) && 
      category.items.every(item => API_TYPES.validateCustomDishIngredient(item))
    
    return isValidStructure && hasValidItems
  },

  calculateCustomDishPrice: (selectedIngredients) => {
    return Object.values(selectedIngredients).reduce((total, selection) => {
      const price = selection.customPrice || selection.ingredient.price
      return total + (price * selection.quantity)
    }, 0)
  },

  calculateCustomDishWeight: (selectedIngredients) => {
    return Object.values(selectedIngredients).reduce((total, selection) => {
      return total + (selection.ingredient.weight * selection.quantity)
    }, 0)
  },

  calculateCustomDishCalories: (selectedIngredients) => {
    return Object.values(selectedIngredients).reduce((total, selection) => {
      const calories = selection.ingredient.calories || 0
      const weight = selection.ingredient.weight * selection.quantity
      return total + (calories * weight / 100) // калории на 100г
    }, 0)
  },

  validateCustomDish: (categories, selectedIngredients) => {
    const errors = []
    const warnings = []
    let completeness = 0
    
    // Проверяем обязательные категории
    const requiredCategories = categories.filter(cat => cat.required)
    const selectedCategories = new Set(
      Object.values(selectedIngredients).map(sel => sel.categoryId)
    )
    
    requiredCategories.forEach(category => {
      if (!selectedCategories.has(category.id)) {
        errors.push(`Необходимо выбрать ${category.name.toLowerCase()}`)
      }
    })
    
    // Проверяем ограничения по количеству
    categories.forEach(category => {
      const selectedFromCategory = Object.values(selectedIngredients)
        .filter(sel => sel.categoryId === category.id)
      
      if (selectedFromCategory.length > category.maxSelection) {
        errors.push(`В категории "${category.name}" можно выбрать максимум ${category.maxSelection} элементов`)
      }
      
      if (category.minSelection && selectedFromCategory.length < category.minSelection) {
        warnings.push(`В категории "${category.name}" рекомендуется выбрать минимум ${category.minSelection} элементов`)
      }
    })
    
    // Расчет завершенности
    const totalRequired = requiredCategories.length
    const fulfilledRequired = requiredCategories.filter(cat => 
      selectedCategories.has(cat.id)
    ).length
    
    if (totalRequired > 0) {
      completeness = Math.round((fulfilledRequired / totalRequired) * 100)
    } else {
      completeness = Object.keys(selectedIngredients).length > 0 ? 100 : 0
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness
    }
  },

  createEmptyCustomDish: () => ({
    id: `custom-${Date.now()}`,
    name: 'Кастомное блюдо',
    ingredients: [],
    totalPrice: 0,
    totalWeight: 0,
    totalCalories: 0,
    notes: '',
    createdAt: new Date().toISOString(),
    imageUrl: null
  }),

  convertToCustomDish: (selectedIngredients, name = 'Кастомное блюдо', notes = '') => {
    const ingredients = Object.values(selectedIngredients)
    const totalPrice = API_TYPES.calculateCustomDishPrice(selectedIngredients)
    const totalWeight = API_TYPES.calculateCustomDishWeight(selectedIngredients)
    const totalCalories = API_TYPES.calculateCustomDishCalories(selectedIngredients)
    
    return {
      id: `custom-${Date.now()}`,
      name,
      ingredients,
      totalPrice,
      totalWeight,
      totalCalories,
      notes,
      createdAt: new Date().toISOString(),
      imageUrl: null
    }
  }
}; 