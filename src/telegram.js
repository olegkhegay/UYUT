// Инициализация Telegram WebApp API
const tg = window.Telegram.WebApp;

// Функция для инициализации приложения
export const initTelegramApp = () => {
    tg.ready(); // Подготовка API

    // Пример получения информации о пользователе
    const user = tg.initDataUnsafe.user;
    console.log('Пользователь:', user);

    // Пример отправки сообщения в Telegram
    const sendMessage = (message) => {
        tg.sendData(message);
    };

    // Пример использования функции отправки сообщения
    sendMessage('Привет из моего приложения!');
};
