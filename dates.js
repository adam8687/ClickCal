// Turns relative wording like "tomorrow" or "next Thursday" into a real date.
//
// Everything here is measured from a `now` that the caller passes in. Nothing
// reads the system clock on its own, which is what makes these rules testable:
// a test can claim it is any day it likes.

const WEEKDAY_NAMES = [
  "sunday", "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday",
];

// Accepts "thu", "thurs", "thursday", optionally led by "this" or "next".
const WEEKDAY = /\b(this|next)\s+(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b|\b(sun|mon|tue|wed|thu|fri|sat)(?:day|s?day|nesday|rsday|urday)\b/i;

const TOMORROW = /\btomorrow\b/i;
const TODAY = /\b(today|tonight)\b/i;

function partsOf(date) {
  return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
}

function shiftDays(from, amount) {
  // Building a fresh Date lets the calendar handle month and year rollover,
  // so 30 days after December 20th lands in January without special cases.
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + amount);
}

// How many days forward until the next time this weekday comes around.
// Today counts as zero, so "Friday" said on a Friday means today.
function daysUntilWeekday(from, targetIndex) {
  return (targetIndex - from.getDay() + 7) % 7;
}

function resolveWeekday(match, now) {
  const qualifier = (match[1] || "").toLowerCase();
  const namePrefix = (match[2] || match[3]).toLowerCase();
  const targetIndex = WEEKDAY_NAMES.findIndex((n) => n.startsWith(namePrefix));

  let offset = daysUntilWeekday(now, targetIndex);

  // "next Thursday" means the week after the upcoming one. Said on a Monday,
  // "Thursday" is three days away but "next Thursday" is ten. This is the
  // reading people disagree on, so it is stated once here rather than being
  // scattered through the code.
  if (qualifier === "next") {
    offset += 7;
  }

  return partsOf(shiftDays(now, offset));
}

// Returns { year, month, day } or null when the text says nothing relative.
// `month` counts from zero, matching JavaScript's own Date.
function resolveRelativeDate(text, now = new Date()) {
  if (TOMORROW.test(text)) {
    return partsOf(shiftDays(now, 1));
  }

  if (TODAY.test(text)) {
    return partsOf(now);
  }

  const weekdayMatch = text.match(WEEKDAY);
  if (weekdayMatch) {
    return resolveWeekday(weekdayMatch, now);
  }

  return null;
}

if (typeof module !== "undefined") {
  module.exports = { resolveRelativeDate };
}
