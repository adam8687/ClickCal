# ClickCal

Turn anything on screen into a calendar event, without the page ever leaving your machine.

ClickCal is a Chrome extension that reads the page you're looking at — selected text, embedded
structured data, or a screenshot when there's no text to read — resolves what it finds into a
concrete event, and writes it to Google Calendar in one confirmation.

Parsing runs on-device by default via Chrome's built-in Prompt API. Nothing is sent to a server
unless you explicitly opt into the cloud provider fallback with your own API key.

## Status

Early development.

## Why it's built this way

Most "AI to calendar" tools are a prompt wrapped around a model call, and they fail on the part
users actually notice: turning "next Thursday at 5" into the correct instant, in the correct
timezone, with the correct recurrence. ClickCal treats that as a deterministic problem and
handles it outside the model, then uses measured evaluation to decide where the model is
actually needed.

Design notes and architecture live in `docs/` as they land.
