const modeToggle = document.getElementById('modeToggle');
const standardLabel = document.getElementById('standardLabel');
const advancedLabel = document.getElementById('advancedLabel');
const userAnswerInput = document.getElementById('userAnswer');
const feedback = document.getElementById('feedback');
let correctCount = 0;
let correctAnswer = null;
let revealNext = false;
let startTime = null;

//do i neeed theesse?
let learnSelected = null;
let learnOrder = [];
const learnRow = document.getElementById('learnRow');

let learnMode = false;
let learnBase = null;
let learnIndex = 0;

let times = [];
let avgTimes = [];
let inverseAverages = [];
let graphCtx = document.getElementById('avgTimeGraph').getContext('2d');
let graphVisible = false;

const startButton = document.getElementById('startButton');
const endButton = document.getElementById('endButton');
const dropdownContent = document.getElementById('dropdownContent');
const practiceContent = document.getElementById('practiceContent');

let maxNumber = 12; // Default to standard

const colA = document.getElementById('colA');
const colB = document.getElementById('colB');
let selectedA = Array(maxNumber+1).fill(false); // All selected by default
selectedA[0] = true; // Only the first button (0) is selected by default
let selectedB = Array(maxNumber+1).fill(true);

modeToggle.addEventListener('change', function() {
  if (modeToggle.checked) {
    maxNumber = 20;
    standardLabel.classList.remove('active');
    advancedLabel.classList.add('active');
  } else {
    maxNumber = 12;
    standardLabel.classList.add('active');
    advancedLabel.classList.remove('active');
  }
  // Reset selections
  selectedA = Array(maxNumber + 1).fill(false);
  selectedA[0] = true;
  selectedB = Array(maxNumber + 1).fill(false);
  renderNumberButtons();
  renderLearnRow();
});

function renderLearnRow() {
  learnRow.innerHTML = '';
  for (let i = 0; i <= maxNumber; i++) {
    const btn = document.createElement('button');
    btn.className = 'learn-btn';
    btn.textContent = i;
    btn.onclick = () => {
      startLearn(i);
    };
    learnRow.appendChild(btn);
  }
}

function startLearn(base) {
  learnMode = true;
  learnBase = base;
  learnIndex = 0;
  startButton.style.display = 'none';
  dropdownContent.classList.remove('show');
  setTimeout(() => {
    dropdownContent.classList.add('hidden');
    showLearnProblem();
  }, 500);
}

function showLearnProblem() {
  practiceContent.classList.add('show');
  practiceContent.classList.remove('hidden');
  endButton.style.display = 'block';
  document.getElementById('avgTimeGraph').style.display = 'block';
  graphVisible = true;
  drawGraph();
  userAnswerInput.disabled = false;

  if (learnIndex > maxNumber) {
    document.getElementById('problemDisplay').textContent = "Woohoo!";
    userAnswerInput.value = '';
    userAnswerInput.disabled = true;
    return;
  }
  const a = learnBase;
  const b = learnIndex;
  correctAnswer = a * b;
  document.getElementById('problemDisplay').textContent = `${a} × ${b} = ?`;
  userAnswerInput.value = '';
  document.getElementById('feedback').textContent = '';
  revealNext = false;
  startTime = Date.now();
  userAnswerInput.focus();
}

function checkLearnAnswer() {
  if (!learnMode || correctAnswer === null || revealNext) return;
  const userVal = parseInt(userAnswerInput.value);
  if (isNaN(userVal)) return;
  if (userVal === correctAnswer) {
    // --- Add timing and graph logic here ---
    correctCount++;
    document.getElementById('correctCounter').textContent = `Correct: ${correctCount}`;
    const timeTaken = (Date.now() - startTime) / 1000;
    times.push(timeTaken);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    avgTimes.push(avg);
    const inv = 1 / avg;
    inverseAverages.push(inv);
    if (graphVisible) drawGraph();
    // --- End graph logic ---

    learnIndex++;
    showLearnProblem();
    revealNext = false;
  }
}

function renderNumberButtons() {
  colA.querySelectorAll('.num-btn').forEach(btn => btn.remove());
  colB.querySelectorAll('.num-btn').forEach(btn => btn.remove());
  for (let i = 0; i <= maxNumber; i++) {
    const btnA = document.createElement('button');
    btnA.className = 'num-btn' + (selectedA[i] ? ' selected' : '');
    btnA.textContent = i;
    btnA.onclick = () => { selectedA[i] = !selectedA[i]; renderNumberButtons(); };
    colA.appendChild(btnA);

    const btnB = document.createElement('button');
    btnB.className = 'num-btn' + (selectedB[i] ? ' selected' : '');
    btnB.textContent = i;
    btnB.onclick = () => { selectedB[i] = !selectedB[i]; renderNumberButtons(); };
    colB.appendChild(btnB);
  }
  document.getElementById('selectAllA').classList.toggle('selected', selectedA.every(v => v));
  document.getElementById('selectAllB').classList.toggle('selected', selectedB.every(v => v));
}

function startPractice() {
    if (!selectedA.some(Boolean) || !selectedB.some(Boolean)) {
        document.getElementById('feedback').textContent = "Select at least one number in each column.";
        return;
    }
  startButton.style.display = 'none';
  dropdownContent.classList.remove('show');
  setTimeout(() => {
    dropdownContent.classList.add('hidden');
    showCountdown();
  }, 500);
}

function showCountdown() {
  const countdownEl = document.getElementById('countdown');
  countdownEl.style.display = 'block';
  let count = 3;
  countdownEl.textContent = count + '...';
  practiceContent.classList.remove('show');
  practiceContent.classList.add('hidden');
  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count + '...';
    } else {
      clearInterval(interval);
      countdownEl.style.display = 'none';
      practiceContent.classList.add('show');
      practiceContent.classList.remove('hidden');
      endButton.style.display = 'block'; // Show End button
      generateTimesTableProblem();
      document.getElementById('userAnswer').focus();
      document.getElementById('avgTimeGraph').style.display = 'block';
      graphVisible = true;
      resetGraph();
    }
  }, 700);
}

startButton.addEventListener('click', startPractice);

endButton.addEventListener('click', function() {
  practiceContent.classList.remove('show');
  practiceContent.classList.add('hidden');
  dropdownContent.classList.remove('hidden');
  dropdownContent.classList.add('show');
  startButton.style.display = 'inline-block';
  this.style.display = 'none'; // Hide End button
  document.getElementById('avgTimeGraph').style.display = 'none';
  graphVisible = false;
  learnMode = false;
  learnBase = null;
  learnIndex = 0;
  userAnswerInput.disabled = false;
});

document.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    if (startButton.style.display !== "none" && !startButton.disabled) {
      startButton.click();
    } else if (endButton.style.display !== "none" && !endButton.disabled) {
      endButton.click();
    }
  }
});

// On page load, hide practice content
practiceContent.classList.remove('show');
practiceContent.classList.add('hidden');
renderNumberButtons();
renderLearnRow();



function toggleAll(col) {
    if (col === 'A') {
    const all = !selectedA.every(v => v);
    selectedA = Array(maxNumber + 1).fill(all);
    } else {
    const all = !selectedB.every(v => v);
    selectedB = Array(maxNumber + 1).fill(all);
    }
    renderNumberButtons();
}

renderNumberButtons();

// --- Times Table Problem Logic ---


let prevA = null;
let prevB = null;

function generateTimesTableProblem() {
    // Get selected numbers
    const aOptions = [];
    const bOptions = [];
    for (let i = 0; i <= 20; i++) {
    if (selectedA[i]) aOptions.push(i);
    if (selectedB[i]) bOptions.push(i);
    }
    let a, b;
    // Try up to 10 times to get a different problem
    for (let tries = 0; tries < 10; tries++) {
    a = aOptions[Math.floor(Math.random() * aOptions.length)];
    b = bOptions[Math.floor(Math.random() * bOptions.length)];
    if (a !== prevA || b !== prevB) break;
    }
    prevA = a;
    prevB = b;
    correctAnswer = a * b;
    document.getElementById('problemDisplay').textContent = `${a} × ${b} = ?`;
    document.getElementById('userAnswer').value = '';
    document.getElementById('feedback').textContent = '';
    revealNext = false;
    startTime = Date.now();
    userAnswerInput.focus();
}

function checkTimesTableAnswer() {
    if (correctAnswer === null || revealNext) return;

    const userVal = parseInt(document.getElementById('userAnswer').value);
    if (isNaN(userVal)) return;

    if (userVal === correctAnswer) {
    correctCount++;
    const timeTaken = (Date.now() - startTime) / 1000;
    times.push(timeTaken);

    //Calculate Average and it's inverse
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    avgTimes.push(avg);
    const inv = 1 / avg;
    inverseAverages.push(inv);

    document.getElementById('correctCounter').textContent = `Correct: ${correctCount}`;
    if (graphVisible) drawGraph();
    generateTimesTableProblem();
    revealNext = false;
    }
}

// Listen for Input changes
userAnswerInput.addEventListener("input", function() {
  if (learnMode) {
    checkLearnAnswer();
  } else {
    checkTimesTableAnswer();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "z" || event.key === "Z") { // Check if the "m" key is pressed
    event.preventDefault();
    toggleDropdown();
  }
});

function toggleDropdown() {
  const dropdownContent = document.getElementById("dropdownContent");
  dropdownContent.classList.toggle("show"); // Add or remove the "show" class
}

function resetGraph() {
  times = [];
  avgTimes = [];
  inverseAverages = [];
  drawGraph();
}

function drawGraph() {
  const canvas = document.getElementById('avgTimeGraph');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Find min/max for scaling
  const maxVal = Math.max(...inverseAverages);
  const minVal = Math.min(...inverseAverages);

  // Padding
  const padding = 30;
  const w = canvas.width - padding * 2;
  const h = canvas.height - padding * 2;

  // Draw axes
  ctx.strokeStyle = "#bbb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // Draw line
  ctx.strokeStyle = "#007bff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  inverseAverages.forEach((val, i) => {
    const x = padding + (w * i) / (inverseAverages.length - 1 || 1);
    // Higher inverse = higher on graph
    const y = padding + h - ((val - minVal) / (maxVal - minVal || 1)) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw current value as a dot
  const lastX = padding + (w * (inverseAverages.length - 1)) / (inverseAverages.length - 1 || 1);
  const lastY = padding + h - ((inverseAverages[inverseAverages.length - 1] - minVal) / (maxVal - minVal || 1)) * h;
  ctx.fillStyle = "#007bff";
  ctx.beginPath();
  ctx.arc(lastX, lastY, 4, 0, 2 * Math.PI);
  ctx.fill();

  // Draw labels
  ctx.fillStyle = "#333";
  ctx.font = "12px Inter, sans-serif";
  ctx.fillText("↑ Faster", 5, padding - 8);
  ctx.fillText("Questions →", canvas.width / 2 - 30, canvas.height - 5);
}


// Show numpad on mobile/tablet
function isMobile() {
  return /Mobi|Android|iPad|iPhone/i.test(navigator.userAgent);
}
if (isMobile() || !isMobile()) {
  document.getElementById('numpad').style.display = 'block';
}

document.querySelectorAll('.numpad-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    if (this.id === 'numpad-del') {
      const start = userAnswerInput.selectionStart;
      const end = userAnswerInput.selectionEnd;
      if (start === end && start > 0) {
        userAnswerInput.value = userAnswerInput.value.slice(0, start - 1) + userAnswerInput.value.slice(end);
        userAnswerInput.setSelectionRange(start - 1, start - 1);
      } else {
        userAnswerInput.value = userAnswerInput.value.slice(0, start) + userAnswerInput.value.slice(end);
        userAnswerInput.setSelectionRange(start, start);
      }
      userAnswerInput.dispatchEvent(new Event('input'));
    } else if (this.id === 'numpad-clear') {
      userAnswerInput.value = '';
      userAnswerInput.dispatchEvent(new Event('input'));
    } else if (this.id === 'numpad-left') {
      const pos = userAnswerInput.selectionStart;
      if (pos > 0) {
        userAnswerInput.setSelectionRange(pos - 1, pos - 1);
      }
    } else if (this.id === 'numpad-right') {
      const pos = userAnswerInput.selectionStart;
      if (pos < userAnswerInput.value.length) {
        userAnswerInput.setSelectionRange(pos + 1, pos + 1);
      }
    } else {
      const start = userAnswerInput.selectionStart;
      const end = userAnswerInput.selectionEnd;
      const val = userAnswerInput.value;
      userAnswerInput.value = val.slice(0, start) + this.textContent + val.slice(end);
      userAnswerInput.setSelectionRange(start + 1, start + 1);
      userAnswerInput.dispatchEvent(new Event('input'));
    }
    userAnswerInput.focus();
  });
});