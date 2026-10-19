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
  ["anchor", "cactus"],
  ["velvet", "comet"],
  ["whistle", "glacier"],
  ["wallet", "thunder"],
  ["ladder", "ocean"],
  ["button", "volcano"],
  ["pillow", "compass"],
  ["candle", "tunnel"],
  ["suitcase", "mushroom"],
  ["needle", "desert"],
  ["helmet", "tulip"],
  ["engine", "feather"],
  ["mirror", "pumpkin"],
  ["calendar", "dolphin"],
  ["brick", "violin"],
  ["harbor", "mitten"],
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

const departureList = document.querySelector("#departure-list");
const departuresUpdated = document.querySelector("#departures-updated");
const departuresWidget = document.querySelector("#departures-widget");
const departuresPanel = document.querySelector("#departures-panel");
const departuresToggle = document.querySelector("#departures-toggle");
const enturEndpoint = "https://api.entur.io/journey-planner/v3/graphql";
const departuresQuery = `
  query LademoenToStjordal($dateTime: DateTime!) {
    trip(
      from: { place: "NSR:StopPlace:271" }
      to: { place: "NSR:StopPlace:58948" }
      dateTime: $dateTime
      numTripPatterns: 20
    ) {
      tripPatterns {
        aimedStartTime
        expectedStartTime
        expectedEndTime
        legs {
          mode
          aimedStartTime
          expectedStartTime
          expectedEndTime
          fromPlace { name }
          toPlace { name }
          line { publicCode name transportMode }
        }
      }
    }
  }
`;
let departuresLoading = false;

function formatDepartureTime(dateTime) {
  return new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(new Date(dateTime));
}

function getTransitLegs(pattern) {
  return pattern.legs.filter((leg) => leg.line && ["bus", "rail", "train"].includes(leg.mode));
}

function renderDeparture(pattern) {
  const transitLegs = getTransitLegs(pattern);
  if (!transitLegs.length) {
    return null;
  }

  const row = document.createElement("article");
  row.className = "departure-row";

  const time = document.createElement("div");
  time.className = "departure-time";
  const departureTime = document.createElement("strong");
  departureTime.textContent = formatDepartureTime(pattern.expectedStartTime);
  const arrivalTime = document.createElement("span");
  arrivalTime.textContent = `Arrives ${formatDepartureTime(pattern.expectedEndTime)}`;
  time.append(departureTime, arrivalTime);

  const journey = document.createElement("div");
  journey.className = "departure-journey";
  const services = document.createElement("div");
  services.className = "departure-services";
  transitLegs.forEach((leg) => {
    const isBus = leg.mode === "bus";
    const badge = document.createElement("span");
    badge.className = `transport-badge ${isBus ? "transport-bus" : "transport-train"}`;
    badge.textContent = `${isBus ? "Bus" : "Train"} ${leg.line.publicCode || ""}`.trim();
    services.append(badge);
  });

  const route = document.createElement("span");
  route.className = "departure-route";
  const firstService = transitLegs[0];
  const lastService = transitLegs[transitLegs.length - 1];
  const routeStart = firstService.fromPlace.name;
  const routeEnd = lastService.toPlace.name;
  route.textContent = `${routeStart} → ${routeEnd}`;
  journey.append(services, route);

  const status = document.createElement("span");
  status.className = "departure-status";
  const difference = Math.round(
    (new Date(pattern.expectedStartTime).getTime() - new Date(pattern.aimedStartTime).getTime()) / 60000,
  );
  if (difference > 0) {
    status.textContent = `+${difference} min`;
  } else if (difference < 0) {
    status.textContent = `Early ${Math.abs(difference)} min`;
  } else {
    status.textContent = "On time";
  }
  if (difference > 0) {
    status.classList.add("is-delayed");
  }

  row.append(time, journey, status);
  return row;
}

async function loadDepartures() {
  if (departuresLoading) {
    return;
  }
  departuresLoading = true;
  departureList.setAttribute("aria-busy", "true");

  try {
    const response = await fetch(enturEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ET-Client-Name": "linxicon-internal-game",
      },
      body: JSON.stringify({
        query: departuresQuery,
        variables: { dateTime: new Date().toISOString() },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Entur returned HTTP ${response.status}.`);
    }

    const result = await response.json();
    if (result.errors?.length) {
      throw new Error(result.errors.map((error) => error.message).join(" "));
    }

    const patterns = result.data?.trip?.tripPatterns;
    if (!Array.isArray(patterns)) {
      throw new Error("Entur returned an unexpected departures response.");
    }

    const uniqueDepartures = new Map();
    patterns
      .filter((pattern) => pattern.legs.at(-1)?.toPlace?.name?.includes("Stjørdal"))
      .sort((first, second) => new Date(first.expectedStartTime) - new Date(second.expectedStartTime))
      .forEach((pattern) => {
        const transitLegs = getTransitLegs(pattern);
        if (!transitLegs.length) {
          return;
        }
        const key = transitLegs.map((leg) => `${leg.line.publicCode}:${leg.expectedStartTime}`).join("|");
        if (!uniqueDepartures.has(key)) {
          uniqueDepartures.set(key, pattern);
        }
      });

    departureList.replaceChildren();
    const rows = [...uniqueDepartures.values()].slice(0, 8).map(renderDeparture).filter(Boolean);
    if (rows.length) {
      departureList.append(...rows);
    } else {
      const message = document.createElement("p");
      message.className = "departure-message";
      message.textContent = "No upcoming train or bus journeys found to Stjørdal.";
      departureList.append(message);
    }
    departuresUpdated.textContent = `Updated ${formatDepartureTime(new Date().toISOString())}`;
  } catch (error) {
    const message = document.createElement("p");
    message.className = "departure-message departure-error";
    message.textContent = `Could not load Entur departures: ${error.message}`;
    departureList.replaceChildren(message);
    departuresUpdated.textContent = "Will retry shortly";
  } finally {
    departuresLoading = false;
    departureList.setAttribute("aria-busy", "false");
  }
}

loadDepartures();
window.setInterval(loadDepartures, 60000);

function setDeparturesOpen(isOpen) {
  departuresPanel.hidden = !isOpen;
  departuresToggle.setAttribute("aria-expanded", String(isOpen));
}

departuresToggle.addEventListener("click", () => {
  setDeparturesOpen(departuresPanel.hidden);
});

document.addEventListener("click", (event) => {
  if (event.target instanceof Node && !departuresWidget.contains(event.target)) {
    setDeparturesOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !departuresPanel.hidden) {
    setDeparturesOpen(false);
    departuresToggle.focus();
  }
});

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
