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

const starterWordPairs = [
  ["vessel", "fix"],
  ["coffee", "morning"],
  ["river", "bridge"],
  ["garden", "train"],
  ["paper", "plane"],
  ["moon", "tide"],
  ["copper", "wire"],
  ["winter", "coat"],
  ["stone", "wall"],
  ["music", "note"],
  ["bread", "toast"],
  ["cloud", "rain"],
  ["light", "house"],
  ["book", "shelf"],
  ["green", "grass"],
  ["signal", "track"],
];
let initialWords = chooseStarterWords();
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
  gapWordOne.textContent = words[0];
  gapWordTwo.textContent = words[1];
  gapWordOneValue.textContent = words[0];
  gapWordTwoValue.textContent = words[1];
}

function chooseStarterWords(previousPair) {
  const availablePairs = starterWordPairs.filter((pair) => pair !== previousPair);
  return availablePairs[Math.floor(Math.random() * availablePairs.length)];
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
  const previousPair = initialWords;
  initialWords = chooseStarterWords(previousPair);
  bridgeNodes.forEach((node) => node.remove());
  bridgeNodes = [];
  lines.replaceChildren();
  linksList.replaceChildren();
  count.innerHTML = "There are <strong>2 words</strong> on the board.";
  gapPercent.textContent = "(2.8%)";
  result.hidden = true;
  setSeeds();
  input.value = "";
  input.focus();
});

setSeeds();

const adCarousel = document.querySelector("#rail-ad-carousel");
const adSlides = [...adCarousel.querySelectorAll(".rail-ad-slide")];
const adDots = document.querySelector("#rail-ad-dots");
const adPrevious = document.querySelector("#rail-ad-previous");
const adNext = document.querySelector("#rail-ad-next");
const adMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let activeAd = 0;
let adTimer;

function showAd(index) {
  activeAd = (index + adSlides.length) % adSlides.length;
  adSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeAd;
    slide.hidden = !isActive;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });
  [...adDots.children].forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeAd;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-current", String(isActive));
  });
}

adSlides.forEach((_, index) => {
  const dot = document.createElement("button");
  dot.className = "rail-ad-dot";
  dot.type = "button";
  dot.setAttribute("aria-label", `Show advertisement ${index + 1} of ${adSlides.length}`);
  dot.addEventListener("click", () => showAd(index));
  adDots.append(dot);
});

adPrevious.addEventListener("click", () => showAd(activeAd - 1));
adNext.addEventListener("click", () => showAd(activeAd + 1));

function stopAdRotation() {
  window.clearInterval(adTimer);
}

function startAdRotation() {
  stopAdRotation();
  if (adMotionPreference.matches || document.hidden || adCarousel.matches(":hover, :focus-within")) {
    return;
  }
  adTimer = window.setInterval(() => showAd(activeAd + 1), 6000);
}

adCarousel.addEventListener("mouseenter", stopAdRotation);
adCarousel.addEventListener("mouseleave", startAdRotation);
adCarousel.addEventListener("focusin", stopAdRotation);
adCarousel.addEventListener("focusout", startAdRotation);
document.addEventListener("visibilitychange", startAdRotation);
adMotionPreference.addEventListener("change", startAdRotation);
showAd(activeAd);
startAdRotation();
