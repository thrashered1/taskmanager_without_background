// SECTION: DOM References
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCountLabel = document.getElementById("task-count");
const clearCompletedButton = document.getElementById("clear-completed");
const datePill = document.getElementById("current-date");

// SECTION: State
let tasks = [];
let taskIdCounter = 0;

// Load tasks from localStorage so the list persists per browser
function loadTasks() {
  const stored = window.localStorage.getItem("focuslist.tasks");
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      tasks = parsed;
      taskIdCounter = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
    }
  } catch (e) {
    console.error("Failed to parse stored tasks", e);
  }
}

function saveTasks() {
  window.localStorage.setItem("focuslist.tasks", JSON.stringify(tasks));
}

// SECTION: Rendering
function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskCountLabel.textContent = "No tasks yet. Add your first one!";
    return;
  }

  const remaining = tasks.filter((t) => !t.completed).length;
  if (remaining === 0) {
    taskCountLabel.textContent = "All tasks completed. Nicely done.";
  } else if (remaining === 1) {
    taskCountLabel.textContent = "1 task left for today.";
  } else {
    taskCountLabel.textContent = `${remaining} tasks left for today.`;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");
    li.dataset.id = String(task.id);

    const main = document.createElement("div");
    main.className = "task-item-main";

    const checkboxButton = document.createElement("button");
    checkboxButton.type = "button";
    checkboxButton.className = "task-checkbox icon-btn icon-btn--complete";
    checkboxButton.setAttribute("aria-label", task.completed ? "Mark as not completed" : "Mark as completed");

    const checkboxIndicator = document.createElement("span");
    checkboxIndicator.className = "task-checkbox-indicator";
    checkboxButton.appendChild(checkboxIndicator);

    const label = document.createElement("span");
    label.className = "task-label";
    label.textContent = task.text;

    main.appendChild(checkboxButton);
    main.appendChild(label);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "icon-btn icon-btn--danger";
    deleteButton.textContent = "✕";
    deleteButton.setAttribute("aria-label", "Delete task");

    actions.appendChild(deleteButton);

    li.appendChild(main);
    li.appendChild(actions);

    taskList.appendChild(li);
  });
}

// SECTION: Actions
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTask = {
    id: taskIdCounter++,
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
}

function toggleTaskCompleted(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  const hadCompleted = tasks.some((t) => t.completed);
  if (!hadCompleted) return;
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  renderTasks();
}

// SECTION: Event Handlers
if (taskForm) {
  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask(taskInput.value);
    taskInput.value = "";
    taskInput.focus();
  });
}

if (taskList) {
  taskList.addEventListener("click", (event) => {
    const target = event.target;
    const li = target.closest(".task-item");
    if (!li) return;

    const id = Number(li.dataset.id);

    if (target.closest(".task-checkbox")) {
      toggleTaskCompleted(id);
    } else if (target.closest(".icon-btn--danger")) {
      deleteTask(id);
    }
  });
}

if (clearCompletedButton) {
  clearCompletedButton.addEventListener("click", () => {
    clearCompletedTasks();
  });
}

// SECTION: Date Pill
function formatToday() {
  const today = new Date();
  const weekday = today.toLocaleDateString(undefined, { weekday: "short" });
  const month = today.toLocaleDateString(undefined, { month: "short" });
  const day = today.getDate();
  return `${weekday} • ${month} ${day}`;
}

function initDatePill() {
  if (!datePill) return;
  datePill.textContent = formatToday();
}

// SECTION: Init
function init() {
  loadTasks();
  initDatePill();
  renderTasks();
}

init();
