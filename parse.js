// Pulls a title, date, and time out of a blob of highlighted text.
//
// This is deliberately crude: plain pattern matching, no AI. It exists so the
// whole app works end to end today. The real date handling gets replaced later
// by a proper engine that understands timezones and repeating events.

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

// "March 5", "Mar 5", "March 5, 2026"
const MONTH_DAY = new RegExp(
  `\\b(${MONTHS.map((m) => m.slice(0, 3)).join("|")})[a-z]*\\.?\\s+(\\d{1,2})(?:\\w{2})?(?:,?\\s+(\\d{4}))?`,
  "i"
);

// "3/5", "3/5/2026"
const NUMERIC_DATE = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/;

// "5pm", "5:30 PM", "17:00"
const TIME = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|\b(\d{1,2}):(\d{2})\b/i;

// In Chrome, dates.js loads first and leaves `resolveRelativeDate` on the page.
// Node has no shared globals, so ask for the file directly instead.
const resolveRelative =
  typeof resolveRelativeDate === "function"
    ? resolveRelativeDate
    : require("./dates.js").resolveRelativeDate;

function findDate(text, now) {
  const monthMatch = text.match(MONTH_DAY);
  if (monthMatch) {
    const month = MONTHS.findIndex((m) => m.startsWith(monthMatch[1].toLowerCase()));
    const day = Number(monthMatch[2]);
    const year = monthMatch[3] ? Number(monthMatch[3]) : now.getFullYear();
    return { year, month, day };
  }

  const numericMatch = text.match(NUMERIC_DATE);
  if (numericMatch) {
    let year = numericMatch[3] ? Number(numericMatch[3]) : now.getFullYear();
    if (year < 100) year += 2000;
    return { year, month: Number(numericMatch[1]) - 1, day: Number(numericMatch[2]) };
  }

  // An explicit date always wins; only fall back to wording like "next Friday".
  return resolveRelative(text, now);
}

function findTime(text) {
  const match = text.match(TIME);
  if (!match) return null;

  // The regex has two shapes: 12-hour with am/pm, or bare 24-hour.
  if (match[3]) {
    let hour = Number(match[1]) % 12;
    if (match[3].toLowerCase() === "pm") hour += 12;
    return { hour, minute: Number(match[2] ?? 0) };
  }

  return { hour: Number(match[4]), minute: Number(match[5]) };
}

function findTitle(text) {
  const firstLine = text.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
}

// Returns { title, start, end, hasDate, hasTime }. `start` and `end` are real
// Date objects so the caller never has to think about date math.
function parseEvent(text, now = new Date()) {
  const date = findDate(text, now);
  const time = findTime(text);
  const fallback = now;

  const start = new Date(
    date ? date.year : fallback.getFullYear(),
    date ? date.month : fallback.getMonth(),
    date ? date.day : fallback.getDate(),
    time ? time.hour : 9,
    time ? time.minute : 0
  );

  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return { title: findTitle(text), start, end, hasDate: !!date, hasTime: !!time };
}

// In Chrome this file is a plain script and `parseEvent` is simply global.
// Node has no such globals, so expose it there for the tests.
if (typeof module !== "undefined") {
  module.exports = { parseEvent };
}
