// Run with: node --test

const test = require("node:test");
const assert = require("node:assert");
const { resolveRelativeDate } = require("../dates.js");

// A fixed reference point so these tests mean the same thing forever.
// Wednesday, 2026-03-04.
const WEDNESDAY = new Date(2026, 2, 4);

function resolve(text, now = WEDNESDAY) {
  return resolveRelativeDate(text, now);
}

test("tomorrow is the following day", () => {
  assert.deepStrictEqual(resolve("lunch tomorrow"), { year: 2026, month: 2, day: 5 });
});

test("today and tonight both mean today", () => {
  assert.deepStrictEqual(resolve("due today"), { year: 2026, month: 2, day: 4 });
  assert.deepStrictEqual(resolve("show tonight"), { year: 2026, month: 2, day: 4 });
});

test("a bare weekday means the next one coming up", () => {
  // Wednesday to Friday is two days.
  assert.deepStrictEqual(resolve("standup Friday"), { year: 2026, month: 2, day: 6 });
});

test("saying a weekday on that same weekday means today", () => {
  assert.deepStrictEqual(resolve("deadline Wednesday"), { year: 2026, month: 2, day: 4 });
});

test("next pushes a week past the upcoming one", () => {
  // Upcoming Friday is the 6th, so "next Friday" is the 13th.
  assert.deepStrictEqual(resolve("review next Friday"), { year: 2026, month: 2, day: 13 });
});

test("this keeps the upcoming occurrence", () => {
  assert.deepStrictEqual(resolve("party this Saturday"), { year: 2026, month: 2, day: 7 });
});

test("abbreviations are understood", () => {
  assert.deepStrictEqual(resolve("sync next Thurs"), { year: 2026, month: 2, day: 12 });
});

test("rolls across a month boundary", () => {
  // Saturday, 2026-03-28. Tomorrow is the 29th; next Wednesday is April 8th.
  const late = new Date(2026, 2, 28);

  assert.deepStrictEqual(resolve("tomorrow", late), { year: 2026, month: 2, day: 29 });
  assert.deepStrictEqual(resolve("next Wednesday", late), { year: 2026, month: 3, day: 8 });
});

test("rolls across a year boundary", () => {
  // Thursday, 2026-12-31.
  const newYearsEve = new Date(2026, 11, 31);

  assert.deepStrictEqual(resolve("tomorrow", newYearsEve), { year: 2027, month: 0, day: 1 });
});

test("plain text with no relative wording resolves to nothing", () => {
  assert.strictEqual(resolve("quarterly planning meeting"), null);
});
