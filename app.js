// DOM elements
const habitInput = document.getElementById("habit-input");
const addHabitBtn = document.getElementById("add-habit-btn");
const habitList = document.getElementById("habit-list");
const pointsDisplay = document.getElementById("points");
const levelDisplay = document.getElementById("level");
const progressBar = document.getElementById("progress-bar");
const upgradeBtn = document.getElementById("upgrade-btn");
const badgeList = document.getElementById("badge-list");
const badgePopup = document.getElementById("badge-popup");

// Load data
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let points = parseInt(localStorage.getItem("points")) || 0;
let isPro = JSON.parse(localStorage.getItem("isPro")) || false;
let streaks = JSON.parse(localStorage.getItem("streaks")) || {};
let badges = JSON.parse(localStorage.getItem("badges")) || [];

// Levels
function getLevel() {
  if (points >= 100) return 5;
  if (points >= 50) return 4;
  if (points >= 25) return 3;
  if (points >= 10) return 2;
  return 1;
}

function getProgressPercent() {
  const level = getLevel();
  const nextThreshold = [0,10,25,50,100][level] || 100;
  const prevThreshold = [0,0,10,25,50][level] || 0;
  return ((points - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
}

// Render everything
function renderHabits() {
  habitList.innerHTML = "";

  habits.forEach((habit, index) => {
    const li = document.createElement("li");
    li.textContent = habit.name;

    const doneBtn = document.createElement("button");
    doneBtn.textContent = habit.done ? "✅" : "✔️";
    doneBtn.addEventListener("click", () => toggleHabit(index));

    li.appendChild(doneBtn);

    const streakSpan = document.createElement("span");
    streakSpan.textContent = ` 🔥 ${streaks[habit.name] || 0}d`;
    li.appendChild(streakSpan);

    habitList.appendChild(li);
  });

  pointsDisplay.textContent = `Points: ${points}`;
  levelDisplay.textContent = `Level: ${getLevel()}`;
  progressBar.style.width = getProgressPercent() + "%";

  // Render badges
  badgeList.innerHTML = "";
  badges.forEach(b => {
    const li = document.createElement("li");
    li.textContent = b;
    badgeList.appendChild(li);
  });

  upgradeBtn.style.display = isPro ? "none" : "inline-block";
}

// Toggle habit
function toggleHabit(index) {
  const habit = habits[index];
  habit.done = !habit.done;

  if (habit.done) {
    points += 1;
    streaks[habit.name] = (streaks[habit.name] || 0) + 1;
  } else {
    points -= 1;
    streaks[habit.name] = Math.max((streaks[habit.name] || 1) - 1, 0);
  }

  checkBadges();
  saveData();
  renderHabits();
}

// Add habit
function addHabit() {
  const name = habitInput.value.trim();
  if (!name) return;

  if (!isPro && habits.length >= 5) {
    alert("Free users can only add 5 habits.");
    return;
  }

  habits.push({ name, done: false });
  habitInput.value = "";
  saveData();
  renderHabits();
}

// Check badges and show popup
function checkBadges() {
  const newBadges = [];

  if (points >= 10 && !badges.includes("10 Points")) newBadges.push("10 Points");
  if (points >= 25 && !badges.includes("25 Points")) newBadges.push("25 Points");

  for (const habit in streaks) {
    if (streaks[habit] >= 5 && !badges.includes(`${habit} 5-Day Streak`)) {
      newBadges.push(`${habit} 5-Day Streak`);
    }
    if (streaks[habit] >= 10 && !badges.includes(`${habit} 10-Day Streak`)) {
      newBadges.push(`${habit} 10-Day Streak`);
    }
  }

  newBadges.forEach(b => {
    badges.push(b);
    showBadgePopup(b);
  });
}

// Badge popup animation
function showBadgePopup(badgeName) {
  badgePopup.textContent = `🏆 ${badgeName} Unlocked!`;
  badgePopup.style.opacity = "1";
  badgePopup.style.transform = "translateY(0)";
  setTimeout(() => {
    badgePopup.style.opacity = "0";
    badgePopup.style.transform = "translateY(-30px)";
  }, 2500);
}

// Save all data
function saveData() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("points", points);
  localStorage.setItem("isPro", isPro);
  localStorage.setItem("streaks", JSON.stringify(streaks));
  localStorage.setItem("badges", JSON.stringify(badges));
}

// Upgrade
upgradeBtn.addEventListener("click", () => {
  isPro = true;
  saveData();
  renderHabits();
});

// Add habit
addHabitBtn.addEventListener("click", addHabit);

// Initial render
renderHabits();
