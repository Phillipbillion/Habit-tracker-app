// DOM Elements
const habitInput = document.getElementById("habit-input");
const addHabitBtn = document.getElementById("add-habit-btn");
const habitList = document.getElementById("habit-list");
const pointsDisplay = document.getElementById("points");
const upgradeBtn = document.getElementById("upgrade-btn");
const themeLightBtn = document.getElementById("theme-light-btn");
const themeDarkBtn = document.getElementById("theme-dark-btn");
const themeColorBtn = document.getElementById("theme-color-btn");
const resetDataBtn = document.getElementById("reset-data-btn");
const notificationsToggle = document.getElementById("notifications-toggle");

// Sections
const sectionHome = document.getElementById("section-home");
const sectionStats = document.getElementById("section-stats");
const sectionSettings = document.getElementById("section-settings");
const navHome = document.getElementById("nav-home");
const navStats = document.getElementById("nav-stats");
const navSettings = document.getElementById("nav-settings");

// Data
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let points = parseInt(localStorage.getItem("points")) || 0;
let isPro = JSON.parse(localStorage.getItem("isPro")) || false;
let theme = localStorage.getItem("theme") || "light";
let accentColor = localStorage.getItem("accentColor") || "#4CAF50";

// Apply theme on load
document.body.classList.add(theme + "-mode");
document.documentElement.style.setProperty("--accent-color", accentColor);

// Render habits
function renderHabits() {
  habitList.innerHTML = "";
  habits.forEach((habit, index) => {
    const li = document.createElement("li");
    li.textContent = habit.name;

    const doneBtn = document.createElement("button");
    doneBtn.textContent = habit.done ? "✅" : "✔️";
    doneBtn.addEventListener("click", () => toggleHabit(index));

    li.appendChild(doneBtn);
    habitList.appendChild(li);
  });

  pointsDisplay.textContent = `Points: ${points}`;
  upgradeBtn.style.display = isPro ? "none" : "inline-block";
}

// Toggle habit
function toggleHabit(index) {
  habits[index].done = !habits[index].done;
  points += habits[index].done ? 1 : -1;
  saveData();
  renderHabits();
}

// Add habit
function addHabit() {
  const name = habitInput.value.trim();
  if (!name) return;

  if (!isPro && habits.length >= 5) {
    alert("Free users can only add 5 habits. Upgrade to Pro!");
    return;
  }

  habits.push({ name, done: false });
  habitInput.value = "";
  saveData();
  renderHabits();
}

// Save data
function saveData() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("points", points);
  localStorage.setItem("isPro", isPro);
  localStorage.setItem("theme", theme);
  localStorage.setItem("accentColor", accentColor);
}

// Upgrade
upgradeBtn.addEventListener("click", () => {
  alert("Thank you! You are now Pro!");
  isPro = true;
  saveData();
  renderHabits();
});

// Theme buttons
themeLightBtn.addEventListener("click", () => {
  theme = "light";
  document.body.classList.remove("dark-mode");
  document.body.classList.add("light-mode");
  saveData();
});

themeDarkBtn.addEventListener("click", () => {
  theme = "dark";
  document.body.classList.remove("light-mode");
  document.body.classList.add("dark-mode");
  saveData();
});

// Accent color change
themeColorBtn.addEventListener("click", () => {
  const newColor = prompt("Enter hex color code for accent:", accentColor);
  if (newColor) {
    accentColor = newColor;
    document.documentElement.style.setProperty("--accent-color", accentColor);
    saveData();
  }
});

// Notifications toggle (simulated)
notificationsToggle.addEventListener("change", () => {
  if (notificationsToggle.checked) {
    alert("Notifications enabled! (simulated)");
  } else {
    alert("Notifications disabled!");
  }
});

// Reset data
resetDataBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all data?")) {
    habits = [];
    points = 0;
    isPro = false;
    saveData();
    renderHabits();
  }
});

// Navigation
navHome.addEventListener("click", () => switchSection("home"));
navStats.addEventListener("click", () => switchSection("stats"));
navSettings.addEventListener("click", () => switchSection("settings"));

function switchSection(section) {
  sectionHome.classList.remove("active");
  sectionStats.classList.remove("active");
  sectionSettings.classList.remove("active");
  navHome.classList.remove("active");
  navStats.classList.remove("active");
  navSettings.classList.remove("active");

  if (section === "home") {
    sectionHome.classList.add("active");
    navHome.classList.add("active");
  } else if (section === "stats") {
    sectionStats.classList.add("active");
    navStats.classList.add("active");
  } else if (section === "settings") {
    sectionSettings.classList.add("active");
    navSettings.classList.add("active");
  }
}

// Initial render
renderHabits();
