// DOM elements
const habitInput = document.getElementById("habit-input");
const addHabitBtn = document.getElementById("add-habit-btn");
const habitList = document.getElementById("habit-list");
const pointsDisplay = document.getElementById("points");
const upgradeBtn = document.getElementById("upgrade-btn");

// Load data
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let points = parseInt(localStorage.getItem("points")) || 0;
let isPro = JSON.parse(localStorage.getItem("isPro")) || false;
let streaks = JSON.parse(localStorage.getItem("streaks")) || {};
let badges = JSON.parse(localStorage.getItem("badges")) || [];

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

    // Streak display
    const streakSpan = document.createElement("span");
    streakSpan.textContent = ` 🔥 ${streaks[habit.name] || 0}d`;
    li.appendChild(streakSpan);

    habitList.appendChild(li);
  });

  pointsDisplay.textContent = `Points: ${points}`;

  // Render badges
  const badgeList = document.getElementById("badge-list");
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

// Check badges
function checkBadges() {
  if (points >= 10 && !badges.includes("10 Points")) badges.push("10 Points");

  for (const habit in streaks) {
    if (streaks[habit] >= 5 && !badges.includes(`${habit} 5-Day Streak`)) {
      badges.push(`${habit} 5-Day Streak`);
    }
  }
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
