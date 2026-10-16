const form = document.querySelector("#word-form");
const input = document.querySelector("#word-input");
const stage = document.querySelector("#graph-stage");
const lines = document.querySelector("#graph-lines");
const count = document.querySelector("#board-count");
const wins = document.querySelector("#win-count");
const result = document.querySelector("#result-card");
const resultTitle = document.querySelector("#result-title");
const resultCopy = document.querySelector("#result-copy");
const resetButton = document.querySelector("#reset-button");
const seedOne = document.querySelector("#seed-one");
const seedTwo = document.querySelector("#seed-two");

const initialWords = ["lantern", "orbit"];
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
  line.setAttribute("y1", String(y1 * 7.6));
  line.setAttribute("x2", String(x2 * 10));
  line.setAttribute("y2", String(y2 * 7.6));
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

  addConnection(17, 25, x, y);
  addConnection(x, y, 83, 75);
  count.innerHTML = `There are <strong>${bridgeNodes.length + 2} words</strong> on the board.`;

  winCount += 1;
  wins.textContent = String(winCount);
  resultTitle.textContent = `First try! Win #${winCount}`;
  resultCopy.textContent = `“${word}” connected the dots. Knew you had it.`;
  result.hidden = false;
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
  count.innerHTML = "There are <strong>2 words</strong> on the board.";
  result.hidden = true;
  setSeeds();
  input.value = "";
  input.focus();
});

setSeeds();
