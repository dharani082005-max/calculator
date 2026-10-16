// ---------- State ----------
let current = "0";     // number being typed
let previous = null;   // first operand (string)
let operator = null;   // "+", "−", "×", "÷"
let justEvaluated = false;

// ---------- DOM ----------
const currentEl = document.getElementById("current");
const historyEl = document.getElementById("history");

// ---------- Display ----------
function updateDisplay() {
  currentEl.textContent = current;
  historyEl.textContent = operator ? `${previous} ${operator}` : "";
  document.querySelectorAll(".key.op").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.op === operator && !justEvaluated);
  });
}

// ---------- Core operations ----------
function inputNumber(n) {
  if (justEvaluated) { current = "0"; justEvaluated = false; }
  if (current === "0") current = n;
  else if (current.length < 15) current += n;
  updateDisplay();
}

function inputDecimal() {
  if (justEvaluated) { current = "0"; justEvaluated = false; }
  if (!current.includes(".")) current += ".";
  updateDisplay();
}

function chooseOperator(op) {
  if (operator && !justEvaluated && previous !== null) {
    // chain: 2 + 3 + ... calculates 2 + 3 first
    if (!compute()) return;
  }
  previous = current;
  operator = op;
  justEvaluated = false;
  current = "0";
  updateDisplay();
  historyEl.textContent = `${previous} ${operator}`;
}

function calculate(a, b, op) {
  a = parseFloat(a);
  b = parseFloat(b);
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? null : a / b;
  }
}

function compute() {
  const result = calculate(previous, current, operator);
  if (result === null) {
    clearAll();
    currentEl.textContent = "Can't divide by 0";
    return false;
  }
  // round to avoid 0.1 + 0.2 = 0.30000000000000004
  current = String(parseFloat(result.toPrecision(12)));
  return true;
}

function equals() {
  if (!operator || previous === null) return;
  const expression = `${previous} ${operator} ${current} =`;
  if (!compute()) return;
  operator = null;
  previous = null;
  justEvaluated = true;
  updateDisplay();
  historyEl.textContent = expression;
}

function percent() {
  current = String(parseFloat(current) / 100);
  updateDisplay();
}

function deleteLast() {
  if (justEvaluated) return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  updateDisplay();
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  justEvaluated = false;
  updateDisplay();
}

// ---------- Mouse / touch ----------
document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.num !== undefined) inputNumber(btn.dataset.num);
  else if (btn.dataset.op) chooseOperator(btn.dataset.op);
  else {
    const actions = { clear: clearAll, delete: deleteLast, decimal: inputDecimal, equals, percent };
    actions[btn.dataset.action]();
  }
});

// ---------- Keyboard support ----------
const opKeys = { "+": "+", "-": "−", "*": "×", "/": "÷" };

document.addEventListener("keydown", (e) => {
  let selector = null;

  if (e.key >= "0" && e.key <= "9") { inputNumber(e.key); selector = `[data-num="${e.key}"]`; }
  else if (e.key === ".") { inputDecimal(); selector = '[data-action="decimal"]'; }
  else if (opKeys[e.key]) { chooseOperator(opKeys[e.key]); selector = `[data-op="${opKeys[e.key]}"]`; }
  else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); selector = '[data-action="equals"]'; }
  else if (e.key === "Backspace") { deleteLast(); selector = '[data-action="delete"]'; }
  else if (e.key === "Escape" || e.key.toLowerCase() === "c") { clearAll(); selector = '[data-action="clear"]'; }
  else if (e.key === "%") { percent(); selector = '[data-action="percent"]'; }

  if (selector) {
    const btn = document.querySelector(selector);
    btn.classList.add("pressed");
    setTimeout(() => btn.classList.remove("pressed"), 100);
  }
});

updateDisplay();
