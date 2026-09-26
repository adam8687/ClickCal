// Builds the Google Calendar "new event" link.
//
// Google accepts a prefilled event as URL parameters, so we don't need the user
// to sign in or grant permissions. The tradeoff is that they see Google's own
// confirmation screen instead of the event being saved silently. Swapping this
// for the Calendar API later only changes this file.

// Google wants "20260305T153000" with no punctuation and no timezone marker,
// which it reads in the calendar's own timezone.
function formatStamp(date) {
  const pad = (n) => String(n).padStart(2, "0");

  return (
    String(date.getFullYear()) +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    "00"
  );
}

function buildCalendarUrl(event, sourceUrl) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatStamp(event.start)}/${formatStamp(event.end)}`,
  });

  if (sourceUrl) {
    params.set("details", `Captured by ClickCal from ${sourceUrl}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
