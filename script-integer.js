let correctAnswer = null;
let correctCount = 0;
let revealNext = false;
let startTime = null;

const problemDisplay = document.getElementById("problemDisplay");
const userAnswerInput = document.getElementById("userAnswer");
const feedbackSettings = document.getElementById("feedback-settings");
const feedbackProblem = document.getElementById("feedback-problem");
const operationButtons = document.querySelectorAll(".op-btn");
const integerDivisionCheckbox = document.getElementById("integerDivision");
const startButton = document.getElementById("startButton");
const endButton = document.getElementById("endButton");
const dropdownContent = document.getElementById("dropdownContent");
const practiceContent = document.getElementById("practiceContent");
const countdownEl = document.getElementById("countdown");


operationButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("selected");
  });
});

function getSelectedOperations() {
  return Array.from(document.querySelectorAll(".op-btn.selected"))
              .map(btn => btn.dataset.op);
}

function generateRandomNumber(digits, exclude = []) {
  const possibleDigits = [..."0123456789"].filter(d => !exclude.includes(d));
  if (possibleDigits.length === 0) return NaN;
  let num = "";
  for (let i = 0; i < digits; i++) {
    let randDigit = possibleDigits[Math.floor(Math.random() * possibleDigits.length)];
    if (i === 0 && randDigit === '0') {
      if (!exclude.includes("1")){
        randDigit = '1'; // prevent leading zero
        num += randDigit;
        continue;
      }
      else {
        i--;
        continue;
      }
    }  
    num+=randDigit;
  }
  return parseInt(num);
}

function generateProblem() {
  revealNext = false;
  userAnswerInput.value = "";
  startTime = Date.now();

  const digitsA = parseInt(document.getElementById("digitsA").value);
  const digitsB = parseInt(document.getElementById("digitsB").value);
  const excludeInput = document.getElementById("excludeDigits").value;
  const allowNeg = document.getElementById("allowNegatives").checked;
  const operations = getSelectedOperations();
  const integerDivisionOnly = integerDivisionCheckbox.checked;

  const exclude = excludeInput ? excludeInput.split(/[^\d]/).filter(Boolean) : [];
  let a = generateRandomNumber(digitsA, exclude);
  let b = generateRandomNumber(digitsB, exclude);

  let op = operations[Math.floor(Math.random() * operations.length)];

  if (allowNeg && Math.random() < 0.5) a *= -1;
  if (allowNeg && Math.random() < 0.5) b *= -1;

  switch (op) {
    case "+":
      correctAnswer = a + b;
      break;
    case "-":
      correctAnswer = a - b;
      break;
    case "×":
      correctAnswer = a * b;
      break;
    case "÷":
      if (integerDivisionOnly) {
        // Ensure a is divisible by b and prevent leading zeros
        while (a % b !== 0) {
          a = generateRandomNumber(digitsA, exclude);
        }
        correctAnswer = Math.floor(a / b);
        a = correctAnswer * b; // make it evenly divisible
      } else {
        correctAnswer = a / b;
      }
      break;
  }

  problemDisplay.textContent = `${a} ${op} ${b} = ?`;
  userAnswerInput.focus();
}

function checkAnswer() {
  if (correctAnswer === null || revealNext) return;

  const userVal = parseInt(userAnswerInput.value);

  if (isNaN(userVal)) return;

  if (userVal === correctAnswer) {
    const endTime = Date.now();
    const timeTaken = ((endTime - startTime)/1000).toFixed(2);
    correctCount++;
    document.getElementById("correctCounter").textContent = `Correct: ${correctCount}`;
    feedbackProblem.textContent = `Correct! ✅ You took ${timeTaken} seconds.`;
    generateProblem();
    revealNext = false;
  }
}

// Countdown logic
function showCountdown() {
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
      endButton.style.display = 'block';
      generateProblem();
      userAnswerInput.focus();
    }
  }, 700);
}

// Start/End button logic
startButton.addEventListener('click', function() {
  // Always get the latest values
  const digitsA = document.getElementById("digitsA").value;
  const digitsB = document.getElementById("digitsB").value;
  const integerDivisionOnly = integerDivisionCheckbox.checked;
  const operations = getSelectedOperations();

  // Validate digit inputs
  if (
    digitsA === "" || digitsB === "" ||
    isNaN(Number(digitsA)) || isNaN(Number(digitsB)) ||
    Number(digitsA) <= 0 || Number(digitsB) <= 0
  ) {
    feedbackSettings.textContent = "Please enter a valid digit length for both numbers.";
    return;
  }

  // Validate operation selection
  if (operations.length === 0) {
    feedbackSettings.textContent = "Select at least one operation.";
    return;
  }

  // Validate integer division constraint
  if (
    integerDivisionOnly &&
    operations.includes("÷") &&
    Number(digitsA) < Number(digitsB)
  ) {
    feedbackSettings.textContent = "To allow integer division, the first number must have at least as many digits as the second.";
    return;
  }

  // All checks passed, start session
  startButton.style.display = 'none';
  dropdownContent.classList.remove('show');
  setTimeout(() => {
    dropdownContent.classList.add('hidden');
    showCountdown();
  }, 500);
});

endButton.addEventListener('click', function() {
  practiceContent.classList.remove('show');
  practiceContent.classList.add('hidden');
  dropdownContent.classList.remove('hidden');
  dropdownContent.classList.add('show');
  startButton.style.display = 'inline-block';
  this.style.display = 'none';
  userAnswerInput.disabled = false;
  feedbackProblem.textContent = "";
});

// Input and numpad logic
userAnswerInput.addEventListener("input", checkAnswer);

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

// Keyboard shortcuts
document.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    if (startButton.style.display !== "none" && !startButton.disabled) {
      startButton.click();
    } else if (endButton.style.display !== "none" && !endButton.disabled) {
      endButton.click();
    }
  }
  if (event.key === "z" || event.key === "Z") {
    event.preventDefault();
    toggleDropdown();
  }
});

function toggleDropdown() {
  dropdownContent.classList.toggle("show");
}

// On page load, hide practice content
practiceContent.classList.remove('show');
practiceContent.classList.add('hidden');

function isMobile() {
  return /Mobi|Android|iPad|iPhone/i.test(navigator.userAgent);
}
// Run this after showing practiceContent
if (isMobile()) {
  document.getElementById('numpad').style.display = 'block';
} else {
  document.getElementById('numpad').style.display = 'none';
}