const DEFAULT_DECK = [
  { term: "こんにちは", answer: "Hello (Japanese)", tag: "JP" },
  { term: "hola", answer: "hello (Spanish)", tag: "ES" },
  { term: "bonjour", answer: "hello (French)", tag: "FR" },
  { term: "guten Tag", answer: "good day (German)", tag: "DE" },
  { term: "ciao", answer: "hi/bye (Italian)", tag: "IT" }
];

const KEY = "lcfp_deck_v1";
function loadDeck() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [...DEFAULT_DECK];
  } catch { return [...DEFAULT_DECK]; }
}
function saveDeck(deck) { localStorage.setItem(KEY, JSON.stringify(deck)); }

let deck = loadDeck();
let index = 0;
let showingAnswer = false;

// Elements
const cardEl = document.getElementById("card");
const termEl = document.getElementById("term");
const answerEl = document.getElementById("answer");
const counterEl = document.getElementById("counter");
const modeEl = document.getElementById("mode");
const deckInfoEl = document.getElementById("deckInfo");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const flipBtn = document.getElementById("flipBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const resetBtn = document.getElementById("resetBtn");

const termInput = document.getElementById("termInput");
const answerInput = document.getElementById("answerInput");
const langInput = document.getElementById("langInput");
const addBtn = document.getElementById("addBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

// Rendering
function renderChips() {
  deckInfoEl.innerHTML = "";
  const size = document.createElement("span");
  size.className = "chip";
  size.textContent = `Cards: ${deck.length}`;
  deckInfoEl.appendChild(size);
  const tagSet = [...new Set(deck.map(d => d.tag).filter(Boolean))];
  tagSet.slice(0,6).forEach(t => {
    const el = document.createElement("span");
    el.className = "chip";
    el.textContent = t;
    deckInfoEl.appendChild(el);
  });
}

function render() {
  const current = deck[index] || { term: "—", answer: "—" };
  termEl.textContent = current.term;
  answerEl.textContent = current.answer;
  counterEl.textContent = `${Math.min(index+1, deck.length)}/${deck.length || 1}`;
  modeEl.textContent = showingAnswer ? "Answer" : "Term";
  cardEl.classList.toggle("show", showingAnswer);
  renderChips();
}

// Actions
function flip() { showingAnswer = !showingAnswer; render(); }
function next() { if (deck.length) { index = (index + 1) % deck.length; showingAnswer = false; render(); } }
function prev() { if (deck.length) { index = (index - 1 + deck.length) % deck.length; showingAnswer = false; render(); } }
function shuffle() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  index = 0; showingAnswer = false; saveDeck(deck); render();
}
function reset() { deck = [...DEFAULT_DECK]; index = 0; showingAnswer = false; saveDeck(deck); render(); }
function addCard() {
  const term = termInput.value.trim();
  const answer = answerInput.value.trim();
  if (!term || !answer) { alert("Please enter both Term and Meaning."); return; }
  const tag = (langInput.value || "").trim();
  deck.push({ term, answer, tag: tag || undefined });
  saveDeck(deck);
  termInput.value = ""; answerInput.value = ""; langInput.value = "";
  index = deck.length - 1; showingAnswer = false; render();
}
function exportJSON() {
  const blob = new Blob([JSON.stringify(deck, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "languageFlashCardPlatForm_deck.json"; a.click();
  URL.revokeObjectURL(url);
}
function importJSON(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error("Invalid format");
      deck = data.map(x => ({ term: String(x.term||""), answer: String(x.answer||""), tag: x.tag || undefined }))
                 .filter(x => x.term && x.answer);
      index = 0; showingAnswer = false; saveDeck(deck); render();
    } catch { alert("Import failed: invalid JSON deck."); }
  };
  reader.readAsText(file);
}

// Events
cardEl.addEventListener("click", flip);
flipBtn.addEventListener("click", flip);
nextBtn.addEventListener("click", next);
prevBtn.addEventListener("click", prev);
shuffleBtn.addEventListener("click", shuffle);
resetBtn.addEventListener("click", reset);
addBtn.addEventListener("click", addCard);
exportBtn.addEventListener("click", exportJSON);
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", e => {
  const f = e.target.files?.[0];
  if (f) importJSON(f);
  importFile.value = "";
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); flip(); }
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
});

// Init
render();
