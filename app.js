// Get DOM elements
const habitInput = document.getElementById("habit-input");
const addHabitBtn = document.getElementById("add-habit-btn");
const habitList = document.getElementById("habit-list");
const pointsDisplay = document.getElementById("points");
const upgradeBtn = document.getElementById("upgrade-btn");

// Load data from localStorage
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let points = parseInt(localStorage.getItem("points")) || 0;
let isPro = JSON.parse(localStorage.getItem("isPro")) || false;

// Load streaks and badges
let streaks = JSON.parse(localStorage.getItem("streaks")) || {};
let badges = JSON.parse(localStorage.getItem("badges")) || [];

// Render habits and UI
function renderHabits() {
  habitList.innerHTML = "";
  habits.forEach((habit, index) => {
    const li = document.createElement("li");
    li.textContent = habit.name;

    const doneBtn = document.createElement("button");
    doneBtn.textContent = habit.done ? "✅" : "✔️";
    doneBtn.addEventListener("click", () => toggleHabit(index));

    li.appendChild(doneBtn);

    // Show streak
    const streakSpan = document.createElement("span");
    const habitStreak = streaks[habit.name] || 0;
    streakSpan.textContent = ` 🔥 ${habitStreak}d`;
    li.appendChild(streakSpan);

    habitList.appendChild(li);
  });

  pointsDisplay.textContent = `Points: ${points}`;

  // Hide upgrade button if Pro
  upgradeBtn.style.display = isPro ? "none" : "inline-block";

  // Show badges in console for now
  console.log("Badges unlocked:", badges);
}

// Toggle habit done
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
  if (name === "") return;

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
  // Badge for 10 points
  if (points >= 10 && !badges.includes("10 Points")) badges.push("10 Points");

  // Badge for 5-day streak
  for (const habit in streaks) {
    if (streaks[habit] >= 5 && !badges.includes(`${habit} 5-Day Streak`)) {
      badges.push(`${habit} 5-Day Streak`);
    }
  }
}

// Save to localStorage
function saveData() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("points", points);
  localStorage.setItem("isPro", isPro);
  localStorage.setItem("streaks", JSON.stringify(streaks));
  localStorage.setItem("badges", JSON.stringify(badges));
}

// Upgrade button
upgradeBtn.addEventListener("click", () => {
  isPro = true;
  saveData();
  renderHabits();
});

// Add habit button
addHabitBtn.addEventListener("click", addHabit);

// Initial render
renderHabits();
