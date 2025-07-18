import React, { useState, useRef } from 'react';
import signalRService from '../../services/signalRService';
import styles from './PaymentPhotoUpload.module.scss';

const PaymentPhotoUpload = ({ orderId, onPhotoUploaded, onError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Валидация файла
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Поддерживаются только изображения: JPEG, PNG, WebP');
    }

    if (file.size > maxSize) {
      throw new Error('Размер файла не должен превышать 5MB');
    }

    return true;
  };

  // Обработка выбора файла
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      validateFile(file);
      setSelectedFile(file);
      setError(null);

      // Создание предпросмотра
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setSelectedFile(null);
      setPreview(null);
    }
  };

  // Обработка клика по области загрузки
  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  // Обработка drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  };

  // Загрузка фото
  const handleUpload = async () => {
    if (!selectedFile || !orderId) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Проверяем подключение к SignalR
      if (!signalRService.getConnectionStatus().isConnected) {
        await signalRService.initializeConnection();
      }

      // Конвертируем файл в base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const photoData = e.target.result;
        
        // Симуляция прогресса загрузки
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        try {
          // Отправляем фото через SignalR
          await signalRService.sendPaymentPhoto(orderId, photoData, {
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
            uploadTime: new Date().toISOString()
          });

          clearInterval(progressInterval);
          setUploadProgress(100);

          // Уведомляем родительский компонент
          if (onPhotoUploaded) {
            onPhotoUploaded({
              orderId,
              fileName: selectedFile.name,
              uploadTime: new Date().toISOString()
            });
          }

          // Очищаем форму
          setTimeout(() => {
            setSelectedFile(null);
            setPreview(null);
            setUploadProgress(0);
            setIsUploading(false);
          }, 1000);

        } catch (uploadError) {
          clearInterval(progressInterval);
          throw uploadError;
        }
      };

      reader.readAsDataURL(selectedFile);

    } catch (err) {
      console.error('Ошибка загрузки фото:', err);
      setError(err.message || 'Ошибка загрузки фото');
      setIsUploading(false);
      setUploadProgress(0);
      
      if (onError) {
        onError(err);
      }
    }
  };

  // Удаление выбранного файла
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.paymentPhotoUpload}>
      <div className={styles.header}>
        <h3>Подтверждение оплаты</h3>
        <p>Загрузите фото чека или скриншот оплаты для подтверждения заказа</p>
      </div>

      <div className={styles.uploadArea}>
        {!selectedFile ? (
          <div
            className={styles.dropZone}
            onClick={handleDropZoneClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className={styles.dropZoneContent}>
              <div className={styles.uploadIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 16L12 8M12 8L15 11M12 8L9 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 15V16C3 18.8284 3 20.2426 3.87868 21.1213C4.75736 22 6.17157 22 9 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className={styles.dropZoneText}>
                Нажмите или перетащите фото чека
              </p>
              <p className={styles.dropZoneHint}>
                Поддерживаются: JPEG, PNG, WebP (до 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.filePreview}>
            <div className={styles.previewImage}>
              <img src={preview} alt="Предпросмотр" />
            </div>
            <div className={styles.fileInfo}>
              <p className={styles.fileName}>{selectedFile.name}</p>
              <p className={styles.fileSize}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              className={styles.removeButton}
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              Удалить
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className={styles.hiddenInput}
        />
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {isUploading && (
        <div className={styles.uploadProgress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className={styles.progressText}>
            Загрузка... {uploadProgress}%
          </p>
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={`${styles.uploadButton} ${!selectedFile || isUploading ? styles.disabled : ''}`}
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Загрузка...' : 'Отправить фото'}
        </button>
      </div>

      <div className={styles.instructions}>
        <h4>Инструкции:</h4>
        <ul>
          <li>Сделайте четкое фото чека или скриншота оплаты</li>
          <li>Убедитесь, что видны сумма, дата и номер заказа</li>
          <li>Фото будет отправлено администратору для проверки</li>
          <li>Статус подтверждения придет в реальном времени</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentPhotoUpload; 