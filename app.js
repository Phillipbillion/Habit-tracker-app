// DOM Elements
const habitInput = document.getElementById("habit-input");
const addHabitBtn = document.getElementById("add-habit-btn");
const habitList = document.getElementById("habit-list");
const pointsDisplay = document.getElementById("points");
const upgradeBtn = document.getElementById("upgrade-btn");
const themeToggleBtn = document.getElementById("theme-toggle-btn");

const todayCompletedEl = document.getElementById("today-completed");
const longestStreakEl = document.getElementById("longest-streak");
const weeklyCompletedEl = document.getElementById("weekly-completed");
const monthlyCompletedEl = document.getElementById("monthly-completed");
const weeklyChartCanvas = document.getElementById("weekly-chart");
const monthlyChartCanvas = document.getElementById("monthly-chart");
const aiSuggestionsList = document.getElementById("ai-suggestions-list");

// Data
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let points = parseInt(localStorage.getItem("points")) || 0;
let isPro = JSON.parse(localStorage.getItem("isPro")) || false;
let streaks = JSON.parse(localStorage.getItem("streaks")) || {};
let completionDates = JSON.parse(localStorage.getItem("completionDates")) || {};
let badges = JSON.parse(localStorage.getItem("badges")) || [];
let currentThemeIndex = 0;
let weeklyChart, monthlyChart;

// ------------------- Helper -------------------
function getToday() {
  return new Date().toISOString().split("T")[0];
}

function saveData() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("points", points);
  localStorage.setItem("isPro", isPro);
  localStorage.setItem("streaks", JSON.stringify(streaks));
  localStorage.setItem("completionDates", JSON.stringify(completionDates));
  localStorage.setItem("badges", JSON.stringify(badges));
}

// ------------------- Habits -------------------
function renderHabits() {
  habitList.innerHTML = "";
  habits.forEach((habit, index) => {
    const li = document.createElement("li");
    li.textContent = habit.name;

    // Done Button
    const doneBtn = document.createElement("button");
    doneBtn.textContent = habit.done ? "✅" : "✔️";
    doneBtn.addEventListener("click", () => toggleHabit(index));
    li.appendChild(doneBtn);

    // Reminder
    const reminderInput = document.createElement("input");
    reminderInput.type = "time";
    reminderInput.id = `reminder-time-${index}`;
    reminderInput.value = habit.reminderTime || "";
    const setReminderBtn = document.createElement("button");
    setReminderBtn.textContent = habit.reminderTime ? "Update Reminder" : "Set Reminder";
    setReminderBtn.addEventListener("click", () => setReminder(index));
    li.appendChild(reminderInput);
    li.appendChild(setReminderBtn);

    habitList.appendChild(li);
  });
  pointsDisplay.textContent = `Points: ${points}`;
  upgradeBtn.style.display = isPro ? "none" : "block";
}

// Toggle Done
function toggleHabit(index) {
  habits[index].done = !habits[index].done;
  const today = getToday();
  if (!completionDates[habits[index].name]) completionDates[habits[index].name] = [];
  if (habits[index].done) {
    points++;
    completionDates[habits[index].name].push(today);
    streaks[habits[index].name] = (streaks[habits[index].name] || 0) + 1;
  } else {
    points--;
    const idx = completionDates[habits[index].name].indexOf(today);
    if (idx > -1) completionDates[habits[index].name].splice(idx, 1);
    streaks[habits[index].name] = Math.max((streaks[habits[index].name] || 1) -1,0);
  }
  saveData();
  renderAll();
}

// Add Habit
function addHabit() {
  const name = habitInput.value.trim();
  if (!name) return;
  if (!isPro && habits.length >= 5) {
    alert("Free users can only add 5 habits. Upgrade to Pro for unlimited habits!");
    return;
  }
  habits.push({ name, done:false });
  habitInput.value = "";
  saveData();
  renderAll();
}

// ------------------- Upgrade -------------------
upgradeBtn.addEventListener("click", () => {
  alert("Thank you! You are now Pro!");
  isPro = true;
  saveData();
  renderAll();
});

// ------------------- Theme -------------------
const themes = ["", "dark-mode", "blue-mode", "purple-mode"];
themeToggleBtn.addEventListener("click", () => {
  if (!isPro) {
    document.body.className = document.body.className === "dark-mode" ? "" : "dark-mode";
  } else {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    document.body.className = themes[currentThemeIndex];
  }
});

// ------------------- Reminders -------------------
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}
requestNotificationPermission();

function setReminder(index) {
  const timeInput = document.getElementById(`reminder-time-${index}`);
  habits[index].reminderTime = timeInput.value;
  saveData();
  alert(`Reminder set for ${habits[index].name} at ${timeInput.value}`);
}

setInterval(() => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0,5);
  habits.forEach(habit => {
    if (habit.reminderTime === currentTime && !habit.notifiedToday) {
      if (Notification.permission === "granted") {
        new Notification(`Reminder: Complete "${habit.name}"!`);
      }
      habit.notifiedToday = true;
    }
    if (currentTime === "00:00") habit.notifiedToday = false;
  });
},60000);

// ------------------- Stats -------------------
function renderStats() {
  let todayCount=0, longest=0;
  const today = getToday();
  habits.forEach(h=> {
    if(completionDates[h.name]?.includes(today)) todayCount++;
    longest = Math.max(longest, streaks[h.name]||0);
  });
  todayCompletedEl.textContent = `Habits completed today: ${todayCount}`;
  longestStreakEl.textContent = `Longest streak: ${longest}`;
}

// ------------------- Analytics -------------------
function renderAnalytics() {
  if(!isPro) { document.getElementById("analytics-panel").style.display="none"; return; }
  document.getElementById("analytics-panel").style.display="block";
  const today=new Date();
  const labelsWeek=[],labelsMonth=[],dataWeek=[],dataMonth=[];
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(today.getDate()-i); const day=d.toISOString().split("T")[0];
    labelsWeek.push(day); let count=0;
    habits.forEach(h=>{ if(completionDates[h.name]?.includes(day)) count++; });
    dataWeek.push(count);
  }
  weeklyCompletedEl.textContent=`Habits completed this week: ${dataWeek.reduce((a,b)=>a+b,0)}`;
  for(let i=29;i>=0;i--){
    const d=new Date(); d.setDate(today.getDate()-i); const day=d.toISOString().split("T")[0];
    labelsMonth.push(day); let count=0;
    habits.forEach(h=>{ if(completionDates[h.name]?.includes(day)) count++; });
    dataMonth.push(count);
  }
  monthlyCompletedEl.textContent=`Habits completed this month: ${dataMonth.reduce((a,b)=>a+b,0)}`;
  if(weeklyChart) weeklyChart.destroy();
  if(monthlyChart) monthlyChart.destroy();
  weeklyChart=new Chart(weeklyChartCanvas,{type:'bar',data:{labels:labelsWeek,datasets:[{label:'Habits Completed',data:dataWeek,backgroundColor:'#4CAF50'}]},options:{responsive:true,plugins:{legend:{display:false}}}});
  monthlyChart=new Chart(monthlyChartCanvas,{type:'line',data:{labels:labelsMonth,datasets:[{label:'Habits Completed',data:dataMonth,borderColor:'#2196F3',fill:false}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
}

// ------------------- AI Suggestions -------------------
const motivationalMessages=["You can do it! 🔥","Keep the streak alive! 💪","Small steps every day lead to big results.","Don’t break the chain! ⏳","Your future self will thank you! 🌟","Pro users get exclusive badges – upgrade now! 🏆","Remember why you started today! ✨"];
const suggestedHabits=["Drink 2L of water 💧","Read 20 pages 📚","Meditate 10 min 🧘‍♂️","Exercise 15 min 🏋️","Write a journal entry ✍️","Plan tomorrow's tasks 📝","Take a 5 min stretch break 🤸‍♂️"];
function generateSmartSuggestions(){
  const suggestions=[]; const today=getToday();
  habits.forEach(h=>{
    const streak=streaks[h.name]||0;
    if(streak<2) suggestions.push(`Try focusing on "${h.name}" today to build consistency!`);
    if(streak>=5) suggestions.push(`You're rocking "${h.name}"! Keep it up!`);
  });
  for(let i=0;i<3;i++){ suggestions.push(motivationalMessages[Math.floor(Math.random()*motivationalMessages.length)]); }
  if(habits.length<10){ const randomHabit=suggestedHabits[Math.floor(Math.random()*suggestedHabits.length)]; suggestions.push(`Suggested habit: "${randomHabit}"`); }
  return suggestions;
}
function renderAISuggestions(){
  aiSuggestionsList.innerHTML="";
  if(!isPro){ const li=document.createElement("li"); li.textContent="Upgrade to Pro for AI suggestions & motivational tips!"; aiSuggestionsList.appendChild(li); return; }
  const suggestions=generateSmartSuggestions();
  suggestions.forEach(s=>{ const li=document.createElement("li"); li.textContent=s; aiSuggestionsList.appendChild(li); });
}

// ------------------- All-in-one render -------------------
function renderAll(){
  renderHabits();
  renderStats();
  renderAnalytics();
  renderAISuggestions();
}

// ------------------- Event Listeners -------------------
addHabitBtn.addEventListener("click", addHabit);

// ------------------- Initial render -------------------
renderAll();
