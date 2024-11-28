// push-handler.js

export function scheduleNotifications(tasks) {
    if (!('Notification' in window)) {
      console.warn('Уведомления не поддерживаются вашим браузером.');
      return;
    }
  
    if (Notification.permission !== 'granted') {
      console.warn('Нет разрешения на отправку уведомлений.');
      return;
    }
  
    const now = new Date();
  
    // Перебираем задачи и планируем уведомления
    Object.keys(tasks).forEach((date) => {
      tasks[date].forEach((task) => {
        if (!task.time || task.completed) return; // Пропускаем выполненные задачи
  
        const [hours, minutes] = task.time.split(':').map(Number);
        const taskTime = new Date(date);
        taskTime.setHours(hours, minutes, 0, 0);
  
        // Расчёт времени до задачи
        const timeDiff = taskTime - now;
  
        if (timeDiff > 0) {
          // Уведомления за 30, 15 и 5 минут
          const notifications = [
            { time: timeDiff - 30 * 60 * 1000, message: `Задача "${task.title}" начнётся через 30 минут` },
            { time: timeDiff - 15 * 60 * 1000, message: `Задача "${task.title}" начнётся через 15 минут` },
            { time: timeDiff - 5 * 60 * 1000, message: `Задача "${task.title}" начнётся через 5 минут` },
          ];
  
          notifications.forEach((notif) => {
            if (notif.time > 0) {
              setTimeout(() => {
                sendNotification(task.title, notif.message);
              }, notif.time);
            }
          });
        }
      });
    });
  }
  
  // Отправка уведомления
  function sendNotification(title, message) {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body: message,
          icon: '/icons/icon-192x192.png', // Иконка уведомления
          vibrate: [200, 100, 200],
          tag: 'task-reminder', // Группируем уведомления
          requireInteraction: true, // Уведомление остаётся, пока пользователь не взаимодействует
        });
      });
    }
  }
  