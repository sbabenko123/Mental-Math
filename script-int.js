
// Initialize global variables
let correctAnswer = null;
let correctCount = 0;
let incorrectCount = 0;
let problemCount = 0;
let totalTime = 0;
let triesLeft = 2;
let revealNext = false;
let startTime = null;

// References to DOM (Document Object Model) elements in the HTML file
const problemDisplay = document.getElementById("problemDisplay");
const userAnswerInput = document.getElementById("userAnswer");
const feedback = document.getElementById("feedback");
const operationButtons = document.querySelectorAll(".op-btn"); 
const integerDivisionCheckbox = document.getElementById("integerDivision");

operationButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("selected");
  });
});

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

function getSelectedOperations() {
  return Array.from(document.querySelectorAll(".op-btn.selected"))
              .map(btn => btn.dataset.op);
}

function generateProblem() {
  revealNext = false;
  feedback.textContent = "";
  userAnswerInput.value = "";

  startTime = Date.now();

  const digitsA = parseInt(document.getElementById("digitsA").value);
  const digitsB = parseInt(document.getElementById("digitsB").value);
  const excludeInput = document.getElementById("excludeDigits").value;
  const allowNeg = document.getElementById("allowNegatives").checked;
  const operations = getSelectedOperations();
  const integerDivisionOnly = integerDivisionCheckbox.checked;

  if (operations.length === 0) {
    feedback.textContent = "Select at least one operation.";
    return;
  }

  if (isNaN(digitsA) || isNaN(digitsB)) {
    feedback.textContent = "Enter a digit length."
    return;
  }

  if (digitsA <= 0 || digitsB <= 0) {
    feedback.textContent = "Enter a digit length greater than zero."
    return;
  }

  if (
    integerDivisionOnly &&
    operations.includes("÷") &&
    digitsA < digitsB
  ) {
    feedback.textContent = "To allow integer division, the first number must have at least as many digits as the second.";
    return;
  }

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
    generateProblem();
    revealNext = false;
    feedback.textContent = `✅ Correct! You took ${timeTaken} seconds.`;
  }
}

userAnswerInput.addEventListener("input", checkAnswer);

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