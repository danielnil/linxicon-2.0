const form = document.querySelector("#word-form");
const input = document.querySelector("#word-input");
const stage = document.querySelector("#graph-stage");
const lines = document.querySelector("#graph-lines");
const count = document.querySelector("#board-count");
const result = document.querySelector("#result-card");
const resultTitle = document.querySelector("#result-title");
const resultCopy = document.querySelector("#result-copy");
const resetButton = document.querySelector("#reset-button");
const seedOne = document.querySelector("#seed-one");
const seedTwo = document.querySelector("#seed-two");
const linksList = document.querySelector("#links-list");
const gapWordOne = document.querySelector("#gap-word-one");
const gapWordTwo = document.querySelector("#gap-word-two");
const gapWordOneValue = document.querySelector("#gap-word-one-value");
const gapWordTwoValue = document.querySelector("#gap-word-two-value");
const gapPercent = document.querySelector("#gap-percent");

const initialWords = ["vessel", "fix"];
const bridgePositions = [
  [49, 49],
  [38, 57],
  [61, 42],
  [47, 34],
  [55, 63],
  [34, 39],
  [67, 56],
];
let bridgeNodes = [];
let winCount = 0;

function setSeeds(words = initialWords) {
  seedOne.textContent = words[0];
  seedTwo.textContent = words[1];
}

function addConnection(x1, y1, x2, y2) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.classList.add("graph-line");
  line.setAttribute("x1", String(x1 * 10));
  line.setAttribute("y1", String(y1 * 10));
  line.setAttribute("x2", String(x2 * 10));
  line.setAttribute("y2", String(y2 * 10));
  lines.append(line);
}

function addWord(word) {
  const index = bridgeNodes.length;
  const [x, y] = bridgePositions[index % bridgePositions.length];
  const node = document.createElement("div");
  node.className = "word-node bridge-node";
  node.style.left = `${x}%`;
  node.style.top = `${y}%`;
  node.textContent = word;
  node.setAttribute("aria-label", `Winning word: ${word}`);
  stage.append(node);
  bridgeNodes.push(node);

  addConnection(17, 21, x, y);
  addConnection(x, y, 83, 79);
  count.innerHTML = `There are <strong>${bridgeNodes.length + 2} words</strong> on the board.`;
  gapWordOne.textContent = word;
  gapWordTwo.textContent = initialWords[1];
  gapWordOneValue.textContent = word;
  gapWordTwoValue.textContent = initialWords[1];
  gapPercent.textContent = "(100%)";
  addLink(initialWords[0], word);
  addLink(word, initialWords[1]);

  winCount += 1;
  resultTitle.textContent = `First try! Win #${winCount}`;
  resultCopy.textContent = `“${word}” connected the dots. Knew you had it.`;
  result.hidden = false;
}

function addLink(wordOne, wordTwo) {
  const row = document.createElement("div");
  row.className = "link-row";
  const first = document.createElement("span");
  first.textContent = wordOne;
  const separator = document.createElement("span");
  separator.textContent = "−";
  const second = document.createElement("span");
  second.textContent = wordTwo;
  const score = document.createElement("span");
  score.textContent = "(100%)";
  row.append(first, separator, second, score);
  linksList.prepend(row);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const word = input.value.trim();
  if (!word) {
    input.focus();
    return;
  }

  addWord(word);
  input.value = "";
  input.focus();
});

resetButton.addEventListener("click", () => {
  bridgeNodes.forEach((node) => node.remove());
  bridgeNodes = [];
  lines.replaceChildren();
  linksList.replaceChildren();
  count.innerHTML = "There are <strong>2 words</strong> on the board.";
  gapWordOne.textContent = initialWords[0];
  gapWordTwo.textContent = initialWords[1];
  gapWordOneValue.textContent = initialWords[0];
  gapWordTwoValue.textContent = initialWords[1];
  gapPercent.textContent = "(2.8%)";
  result.hidden = true;
  setSeeds();
  input.value = "";
  input.focus();
});

setSeeds();
