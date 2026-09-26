// Runs when the toolbar popup opens.
//
// The popup is its own little page and cannot see the website directly, so it
// asks Chrome to run a small function inside the current tab and hand back the
// result. That function is `readSelection` below.

const hint = document.getElementById("hint");
const draft = document.getElementById("draft");
const warning = document.getElementById("warning");
const titleInput = document.getElementById("event-title");
const dateInput = document.getElementById("event-date");
const timeInput = document.getElementById("event-time");

let sourceUrl = "";

// This function does NOT run here. Chrome copies it into the webpage and runs
// it there, which is why it can't reference anything from this file.
function readSelection() {
  return window.getSelection().toString().trim();
}

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// The date and time inputs each want their own string format.
function toDateValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Say plainly which parts were guessed, so a wrong guess is never silent.
function describeGaps(event) {
  const missing = [];
  if (!event.hasDate) missing.push("date");
  if (!event.hasTime) missing.push("time");

  if (missing.length === 0) return "";
  return `Couldn't find a ${missing.join(" or ")} — please check below.`;
}

function showDraft(event) {
  titleInput.value = event.title;
  dateInput.value = toDateValue(event.start);
  timeInput.value = toTimeValue(event.start);

  const gaps = describeGaps(event);
  if (gaps) {
    warning.textContent = gaps;
    warning.hidden = false;
  }

  hint.hidden = true;
  draft.hidden = false;
  titleInput.focus();
  titleInput.select();
}

// Rebuild the event from the inputs, so any edits are respected.
function eventFromInputs() {
  const start = new Date(`${dateInput.value}T${timeInput.value || "09:00"}`);
  return {
    title: titleInput.value.trim() || "Untitled event",
    start,
    end: new Date(start.getTime() + 60 * 60 * 1000),
  };
}

draft.addEventListener("submit", (submitEvent) => {
  submitEvent.preventDefault();
  chrome.tabs.create({ url: buildCalendarUrl(eventFromInputs(), sourceUrl) });
  window.close();
});

async function main() {
  const tab = await activeTab();

  // Chrome refuses to inject scripts into its own pages, so fail clearly
  // instead of throwing something cryptic.
  if (!tab || !tab.url || !/^https?:/.test(tab.url)) {
    hint.textContent = "Open a normal web page to use ClickCal.";
    return;
  }

  sourceUrl = tab.url;

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: readSelection,
  });

  const selection = injection.result;

  if (!selection) {
    hint.textContent = "Highlight some text on the page, then click ClickCal.";
    return;
  }

  showDraft(parseEvent(selection));
}

main();
