/* ===== LinguaFlow — app.js ===== */

const inputText      = document.getElementById("inputText");
const sourceLang     = document.getElementById("sourceLang");
const targetLang     = document.getElementById("targetLang");
const translateBtn   = document.getElementById("translateBtn");
const outputArea     = document.getElementById("outputArea");
const charCount      = document.getElementById("charCount");
const copyBtn        = document.getElementById("copyBtn");
const clearBtn       = document.getElementById("clearBtn");
const pasteBtn       = document.getElementById("pasteBtn");
const swapBtn        = document.getElementById("swapBtn");
const ttsInputBtn    = document.getElementById("ttsInputBtn");
const ttsOutputBtn   = document.getElementById("ttsOutputBtn");
const errorBar       = document.getElementById("errorBar");
const historySection = document.getElementById("historySection");
const historyList    = document.getElementById("historyList");
const clearHistoryBtn= document.getElementById("clearHistoryBtn");
const translatedLangBadge = document.getElementById("translatedLangBadge");

let translationHistory = JSON.parse(localStorage.getItem("linguaflow_history") || "[]");
let currentTranslation = "";

// ===== CHAR COUNT =====
inputText.addEventListener("input", () => {
  const len = inputText.value.length;
  charCount.textContent = `${len} / 5000`;
  charCount.style.color = len > 4500 ? "#ff5a5a" : "var(--text-dim)";
});

// ===== CLEAR =====
clearBtn.addEventListener("click", () => {
  inputText.value = "";
  charCount.textContent = "0 / 5000";
  resetOutput();
  hideError();
  inputText.focus();
});

// ===== PASTE =====
pasteBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text.slice(0, 5000);
    inputText.dispatchEvent(new Event("input"));
    inputText.focus();
  } catch {
    showError("Clipboard access denied. Please paste manually (Ctrl+V).");
  }
});

// ===== SWAP LANGUAGES =====
swapBtn.addEventListener("click", () => {
  const srcVal = sourceLang.value;
  const tgtVal = targetLang.value;

  // If source is auto, we can't swap
  if (srcVal === "auto") {
    showError("Cannot swap when source is 'Auto Detect'. Please select a specific source language.");
    return;
  }

  // Check if target exists in source options
  const srcOption = [...sourceLang.options].find(o => o.value === tgtVal);
  if (srcOption) sourceLang.value = tgtVal;

  // Set target to old source (skip 'auto')
  const tgtOption = [...targetLang.options].find(o => o.value === srcVal);
  if (tgtOption) targetLang.value = srcVal;

  // Swap displayed text too
  if (currentTranslation) {
    const oldInput = inputText.value;
    inputText.value = currentTranslation;
    inputText.dispatchEvent(new Event("input"));
    outputArea.innerHTML = `<span class="placeholder-hint">Press Translate to update...</span>`;
    currentTranslation = "";
    copyBtn.disabled = true;
    ttsOutputBtn.disabled = true;
  }
  hideError();
});

// ===== TRANSLATE =====
translateBtn.addEventListener("click", translate);

inputText.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") translate();
});

async function translate() {
  const text = inputText.value.trim();
  if (!text) {
    showError("Please enter some text to translate.");
    inputText.focus();
    return;
  }

  hideError();
  setLoading(true);

  try {
    const response = await fetch("/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        source_lang: sourceLang.value,
        target_lang: targetLang.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || "Translation failed. Please try again.");
      return;
    }

    currentTranslation = data.translated_text;
    outputArea.textContent = currentTranslation;

    // Badge
    const tgtName = targetLang.options[targetLang.selectedIndex].text;
    translatedLangBadge.textContent = tgtName;
    translatedLangBadge.className = "translated-lang-badge";

    // Enable action buttons
    copyBtn.disabled = false;
    ttsOutputBtn.disabled = false;

    // Add to history
    addToHistory(text, currentTranslation, sourceLang.value, targetLang.value);

  } catch (err) {
    showError("Network error. Please check your connection and try again.");
    console.error(err);
  } finally {
    setLoading(false);
  }
}

// ===== COPY =====
copyBtn.addEventListener("click", async () => {
  if (!currentTranslation) return;
  try {
    await navigator.clipboard.writeText(currentTranslation);
    copyBtn.classList.add("copy-success");
    copyBtn.querySelector("svg").innerHTML = `<polyline points="20 6 9 17 4 12"/>`;
    copyBtn.childNodes[2].textContent = " Copied!";
    setTimeout(() => {
      copyBtn.classList.remove("copy-success");
      copyBtn.querySelector("svg").innerHTML = `<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>`;
      copyBtn.childNodes[2].textContent = " Copy";
    }, 2000);
  } catch {
    showError("Could not copy to clipboard.");
  }
});

// ===== TEXT-TO-SPEECH =====
function speak(text, lang) {
  if (!("speechSynthesis" in window)) {
    showError("Text-to-speech is not supported in your browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang === "auto" ? "en" : lang;
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

ttsInputBtn.addEventListener("click", () => {
  const text = inputText.value.trim();
  if (!text) { showError("Nothing to listen to."); return; }
  speak(text, sourceLang.value);
});

ttsOutputBtn.addEventListener("click", () => {
  if (!currentTranslation) return;
  speak(currentTranslation, targetLang.value);
});

// ===== HISTORY =====
function addToHistory(source, translated, srcLang, tgtLang) {
  const entry = {
    id: Date.now(),
    source,
    translated,
    srcLang,
    tgtLang,
    srcName: sourceLang.options[sourceLang.selectedIndex].text,
    tgtName: targetLang.options[targetLang.selectedIndex].text,
  };
  translationHistory.unshift(entry);
  if (translationHistory.length > 20) translationHistory.pop();
  localStorage.setItem("linguaflow_history", JSON.stringify(translationHistory));
  renderHistory();
}

function renderHistory() {
  if (translationHistory.length === 0) {
    historySection.style.display = "none";
    return;
  }
  historySection.style.display = "block";
  historyList.innerHTML = "";
  translationHistory.forEach(entry => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div class="history-text">${escapeHtml(entry.source.slice(0, 80))}${entry.source.length > 80 ? "…" : ""}</div>
      <div class="history-arrow">⟶</div>
      <div>
        <div class="history-text">${escapeHtml(entry.translated.slice(0, 80))}${entry.translated.length > 80 ? "…" : ""}</div>
        <div class="history-lang">${entry.srcName} → ${entry.tgtName}</div>
      </div>
    `;
    item.addEventListener("click", () => {
      inputText.value = entry.source;
      inputText.dispatchEvent(new Event("input"));
      outputArea.textContent = entry.translated;
      currentTranslation = entry.translated;

      // Restore lang selects
      [...sourceLang.options].forEach(o => { if (o.value === entry.srcLang) o.selected = true; });
      [...targetLang.options].forEach(o => { if (o.value === entry.tgtLang) o.selected = true; });

      translatedLangBadge.textContent = entry.tgtName;
      translatedLangBadge.className = "translated-lang-badge";
      copyBtn.disabled = false;
      ttsOutputBtn.disabled = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    historyList.appendChild(item);
  });
}

clearHistoryBtn.addEventListener("click", () => {
  translationHistory = [];
  localStorage.removeItem("linguaflow_history");
  renderHistory();
});

// ===== HELPERS =====
function setLoading(on) {
  translateBtn.classList.toggle("loading", on);
  translateBtn.disabled = on;
}

function resetOutput() {
  outputArea.innerHTML = `<span class="placeholder-hint">Your translation will appear here...</span>`;
  currentTranslation = "";
  copyBtn.disabled = true;
  ttsOutputBtn.disabled = true;
  translatedLangBadge.textContent = "";
  translatedLangBadge.className = "";
}

function showError(msg) {
  errorBar.textContent = msg;
  errorBar.style.display = "block";
  errorBar.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideError() {
  errorBar.style.display = "none";
  errorBar.textContent = "";
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ===== INIT =====
renderHistory();
