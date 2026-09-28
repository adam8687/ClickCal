// Run with: node --test
//
// Node has a test runner built in, so there is nothing to install.

const test = require("node:test");
const assert = require("node:assert");
const { parseEvent } = require("../parse.js");

test("reads a written-out month and a 12-hour time", () => {
  const event = parseEvent("Team Sync\nMarch 5, 2026 at 3:30 PM in ACES 2.402");

  assert.strictEqual(event.title, "Team Sync");
  assert.strictEqual(event.start.getMonth(), 2); // months count from zero
  assert.strictEqual(event.start.getDate(), 5);
  assert.strictEqual(event.start.getFullYear(), 2026);
  assert.strictEqual(event.start.getHours(), 15);
  assert.strictEqual(event.start.getMinutes(), 30);
});

test("reads a slash date and a 24-hour time", () => {
  const event = parseEvent("CS Career Fair\n3/12/2026 10:00");

  assert.strictEqual(event.start.getMonth(), 2);
  assert.strictEqual(event.start.getDate(), 12);
  assert.strictEqual(event.start.getHours(), 10);
});

test("midnight and noon do not collide", () => {
  assert.strictEqual(parseEvent("Party 12am").start.getHours(), 0);
  assert.strictEqual(parseEvent("Lunch 12pm").start.getHours(), 12);
});

test("events last an hour by default", () => {
  const event = parseEvent("Office hours March 5, 2026 1pm");
  const minutes = (event.end - event.start) / 60000;

  assert.strictEqual(minutes, 60);
});

test("admits when it found no date or time", () => {
  const event = parseEvent("Just some text with no date at all");

  assert.strictEqual(event.hasDate, false);
  assert.strictEqual(event.hasTime, false);
});

test("understands relative wording", () => {
  // Wednesday, 2026-03-04.
  const wednesday = new Date(2026, 2, 4);
  const event = parseEvent("Study group tomorrow 5pm", wednesday);

  assert.strictEqual(event.hasDate, true);
  assert.strictEqual(event.start.getDate(), 5);
  assert.strictEqual(event.start.getHours(), 17);
});

test("an explicit date beats relative wording in the same text", () => {
  const wednesday = new Date(2026, 2, 4);
  const event = parseEvent("Rescheduled from tomorrow to March 20, 2026", wednesday);

  assert.strictEqual(event.start.getDate(), 20);
});
