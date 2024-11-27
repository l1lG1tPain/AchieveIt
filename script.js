const dateSliderEl = document.getElementById('date-slider');
const taskListEl = document.getElementById('task-list');
const bottomSheetEl = document.getElementById('bottom-sheet');
const addTaskBtn = document.getElementById('add-task-btn');
const saveTaskBtn = document.getElementById('save-task');
const closeSheetBtn = document.getElementById('close-sheet');

let tasks = JSON.parse(localStorage.getItem('tasks')) || {};
let currentDate = new Date().toISOString().split('T')[0];

// Generate Dates for the Slider
function generateDates() {
  const today = new Date();
  return Array.from({ length: 21 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i - 10);
    return date.toISOString().split('T')[0];
  });
}

// Render Date Slider
function renderDates() {
  const dates = generateDates();
  dateSliderEl.innerHTML = '';
  dates.forEach((date) => {
    const dateEl = document.createElement('div');
    dateEl.className = 'date-item' + (date === currentDate ? ' active' : '');
    dateEl.textContent = formatDate(date);
    dateEl.onclick = () => {
      currentDate = date;
      renderDates();
      renderTasks();
    };
    dateSliderEl.appendChild(dateEl);
  });

  const activeDate = document.querySelector('.date-item.active');
  if (activeDate) {
    activeDate.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  }
}

// Format Date for Display
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
    const taskTime = new Date(`${currentDate}T${task.time}`);
    const now = new Date();

    // Создаем элемент задачи
    const taskEl = document.createElement('div');
    taskEl.className = 'task';

    // Если время задачи уже прошло, добавляем класс "past-task"
    if (taskTime < now) {
      taskEl.classList.add('past-task');
    }

    taskEl.innerHTML = `
      <div class="task-details">
        <p class="task-title">${task.title}</p>
        <p class="task-message">${task.message || ''}</p>
      </div>
      <div class="task-time">
        <span class="time-icon">⏰</span> ${task.time}
      </div>
      <button onclick="deleteTask(${index})">×</button>
    `;
    taskListEl.appendChild(taskEl);
  });
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
  tasks[currentDate].push({ title, time, message });
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

// Clear Bottom Sheet Fields
function clearBottomSheet() {
  document.getElementById('task-title').value = '';
  document.getElementById('task-time').value = '';
  document.getElementById('task-message').value = '';
}

// Open and Close Bottom Sheet
addTaskBtn.onclick = () => bottomSheetEl.classList.add('active');
closeSheetBtn.onclick = () => closeBottomSheet();

function closeBottomSheet() {
  bottomSheetEl.classList.remove('active');
}

let deferredPrompt; // Для сохранения события

// Перехват события beforeinstallprompt
window.addEventListener('beforeinstallprompt', (event) => {
  // Отключаем стандартное поведение
  event.preventDefault();
  deferredPrompt = event; // Сохраняем событие
  showInstallPrompt(); // Показываем кастомный bottom-sheet
});

// Показываем кастомный bottom-sheet
function showInstallPrompt() {
  const installSheet = document.getElementById('install-sheet');
  installSheet.classList.add('active');
}

// Обработка клика на "Установить"
document.getElementById('install-btn').addEventListener('click', async () => {
  if (!deferredPrompt) return;

  // Показать системное окно установки
  deferredPrompt.prompt();

  // Ждем ответа пользователя
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    console.log('Установка принята');
  } else {
    console.log('Установка отклонена');
  }

  deferredPrompt = null; // Сбрасываем событие
  closeInstallSheet(); // Закрываем bottom-sheet
});

// Закрытие bottom-sheet
document.getElementById('close-install-sheet').addEventListener('click', closeInstallSheet);

function closeInstallSheet() {
  const installSheet = document.getElementById('install-sheet');
  installSheet.classList.remove('active');
}


// Initialize
renderDates();
renderTasks();

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
