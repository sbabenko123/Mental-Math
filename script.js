let currentAnswer = null;
let triesLeft = 2;
let revealNext = false;

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
    if (i === 0 && randDigit === '0') randDigit = '1'; // prevent leading zero
    num += randDigit;
  }
  return parseInt(num);
}

function getSelectedOperations() {
  return Array.from(document.querySelectorAll(".op-btn.selected"))
              .map(btn => btn.dataset.op);
}

function generateProblem() {
  triesLeft = 2;
  revealNext = false;
  feedback.textContent = "";
  userAnswerInput.value = "";

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

  // Ensure the first number is not zero in division
  if (operations.includes("÷") && a === 0) {
    a = generateRandomNumber(digitsA, exclude);
  }

  let op = operations[Math.floor(Math.random() * operations.length)];

  if (allowNeg && Math.random() < 0.5) a *= -1;
  if (allowNeg && Math.random() < 0.5) b *= -1;

  switch (op) {
    case "+":
      currentAnswer = a + b;
      break;
    case "-":
      currentAnswer = a - b;
      break;
    case "×":
      currentAnswer = a * b;
      break;
    case "÷":
      if (b === 0) b = 1;
      if (integerDivisionOnly) {
        // Ensure a is divisible by b and prevent leading zeros
        while (a % b !== 0 || a === 0) {
          a = generateRandomNumber(digitsA, exclude);
        }
        currentAnswer = Math.floor(a / b);
        a = currentAnswer * b; // make it evenly divisible
      } else {
        currentAnswer = a / b;
      }
      break;
  }

  problemDisplay.textContent = `${a} ${op} ${b} = ?`;
  userAnswerInput.focus();
}

function checkAnswer() {
  if (currentAnswer === null) return;

  const userVal = parseInt(userAnswerInput.value);

  if (isNaN(userVal)) {
    feedback.textContent = "Please enter a number.";
    return;
  }

  if (revealNext) {
    generateProblem();
    return;
  }

  if (userVal === currentAnswer) {
    feedback.textContent = "✅ Correct!";
    revealNext = true;
  } else {
    triesLeft--;
    if (triesLeft > 0) {
      feedback.textContent = `❌ Try again. (${triesLeft} left)`;
    } else {
      feedback.textContent = `Answer: ${currentAnswer}`;
      revealNext = true;
    }
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    checkAnswer();
  }
});
