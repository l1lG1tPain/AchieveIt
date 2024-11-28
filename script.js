const dateSliderEl = document.getElementById('date-slider');
const taskListEl = document.getElementById('task-list');
const bottomSheetEl = document.getElementById('bottom-sheet');
const addTaskBtn = document.getElementById('add-task-btn');
const saveTaskBtn = document.getElementById('save-task');
const closeSheetBtn = document.getElementById('close-sheet');

let tasks = JSON.parse(localStorage.getItem('tasks')) || {};

// Получение локальной текущей даты
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Локальная дата в формате YYYY-MM-DD
}

let currentDate = getTodayDate(); // Устанавливаем текущую локальную дату

// Генерация дат для слайдера
function generateDates() {
  const today = new Date(currentDate); // Берём текущую дату
  return Array.from({ length: 21 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i - 10); // 10 дней назад и 10 дней вперёд
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Локальная дата
  });
}

// Рендеринг слайдера с датами
function renderDates() {
  console.log(`Рендеринг дат: currentDate = ${currentDate}`); // Лог текущей даты
  const dates = generateDates(); // Генерация массива дат
  dateSliderEl.innerHTML = ''; // Очищаем слайдер

  dates.forEach((date) => {
    const dateEl = document.createElement('div');
    dateEl.className = 'date-item' + (date === currentDate ? ' active' : '');
    dateEl.textContent = formatDate(date); // Форматируем дату
    dateEl.onclick = () => {
      currentDate = date; // Обновляем текущую дату при клике
      console.log(`Пользователь выбрал дату: ${currentDate}`);
      renderDates();
      renderTasks();
    };
    dateSliderEl.appendChild(dateEl); // Добавляем дату в слайдер
  });

  const activeDate = document.querySelector('.date-item.active');
  if (activeDate) {
    activeDate.scrollIntoView({ inline: 'center', behavior: 'smooth' }); // Прокручиваем к активной дате
  }
}

// Проверка и обновление текущей даты
function checkAndUpdateDate() {
  const now = getTodayDate(); // Получаем локальную дату
  console.log(`Проверка даты: currentDate = ${currentDate}, now = ${now}`); // Лог текущей даты и системной даты

  if (currentDate !== now) {
    console.log(`Дата изменилась: обновляем currentDate с ${currentDate} на ${now}`);
    currentDate = now; // Обновляем текущую дату
    renderDates(); // Перерисовываем слайдер
    renderTasks(); // Обновляем задачи
  }
}

// Форматирование даты для отображения
function formatDate(date) {
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return new Date(date).toLocaleDateString('ru-RU', options);
}

// Render Task List
function renderTasks() {
  taskListEl.innerHTML = '';

  // Получаем задачи для текущей даты
  const taskItems = tasks[currentDate] || [];

  // Если задач нет, отображаем сообщение
  if (taskItems.length === 0) {
    taskListEl.innerHTML = '<p class="no-tasks">Задач на выбранную дату нет</p>';
    return;
  }

  // Сортируем задачи по времени
  taskItems.sort((a, b) => a.time.localeCompare(b.time));

  // Рендерим задачи
  taskItems.forEach((task, index) => {
    const taskEl = document.createElement('div');
    taskEl.className = `task ${task.completed ? 'completed' : ''}`;

    taskEl.innerHTML = `
      <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTaskCompletion(${index})">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20.285 6.708l-11.364 11.364-4.95-4.95 1.414-1.414 3.536 3.536 9.95-9.95z"/>
        </svg>
      </div>
      <div class="task-details">
        <p class="task-title">${task.title}</p>
        <p class="task-message">${task.message || ''}</p>
      </div>
      <div class="task-time">
        <span class="time-icon">⏰</span> ${task.time}
      </div>
      <button onclick="deleteTask(${index})">×</button>
    `;

    // Добавляем плавную анимацию при появлении
    taskEl.style.opacity = 0;
    taskEl.style.transform = 'translateY(10px)';
    setTimeout(() => {
      taskEl.style.opacity = 1;
      taskEl.style.transform = 'translateY(0)';
      taskEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }, 50);

    taskListEl.appendChild(taskEl);
  });
}

// Toggle Task Completion
function toggleTaskCompletion(index) {
  // Обновляем состояние задачи
  const taskItems = tasks[currentDate] || [];
  if (taskItems[index]) {
    taskItems[index].completed = !taskItems[index].completed; // Переключаем статус
  }

  // Сохраняем изменения в localStorage
  tasks[currentDate] = taskItems;
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // Перерисовываем список задач
  renderTasks();
}




// Save Task
saveTaskBtn.onclick = () => {
  const title = document.getElementById('task-title').value.trim();
  const time = document.getElementById('task-time').value.trim();
  const message = document.getElementById('task-message').value.trim();

  if (!title || !time) {
    alert('Пожалуйста, заполните заголовок и время!');
    return;
  }
  

  if (!tasks[currentDate]) tasks[currentDate] = [];
  tasks[currentDate].push({ title, time, message, completed: false });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();  
  clearBottomSheet();
  closeBottomSheet();
};

// Delete Task
function deleteTask(index) {
  tasks[currentDate].splice(index, 1);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// Очистка полей Bottom Sheet
function clearBottomSheet() {
  document.getElementById('task-title').value = '';
  document.getElementById('task-time').value = '';
  document.getElementById('task-message').value = '';
}

// Открытие и закрытие Bottom Sheet
addTaskBtn.onclick = () => bottomSheetEl.classList.add('active');
closeSheetBtn.onclick = () => closeBottomSheet();

function closeBottomSheet() {
  bottomSheetEl.classList.remove('active');
}

// Инициализация
renderDates();
renderTasks();
setInterval(checkAndUpdateDate, 60000); // Проверяем смену даты каждые 60 секунд

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker успешно зарегистрирован:', registration);
    })
    .catch((error) => {
      console.error('Ошибка регистрации Service Worker:', error);
    });
}
