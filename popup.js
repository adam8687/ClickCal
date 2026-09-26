// Runs when the toolbar popup opens.
//
// The popup is its own little page and cannot see the website directly, so it
// asks Chrome to run a small function inside the current tab and hand back the
// result. That function is `readSelection` below.

const hint = document.getElementById("hint");
const capture = document.getElementById("capture");

// This function does NOT run here. Chrome copies it into the webpage and runs
// it there, which is why it can't reference anything from this file.
function readSelection() {
  return window.getSelection().toString().trim();
}

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function main() {
  const tab = await activeTab();

  // Chrome refuses to inject scripts into its own pages, so fail clearly
  // instead of throwing something cryptic.
  if (!tab || !tab.url || !/^https?:/.test(tab.url)) {
    hint.textContent = "Open a normal web page to use ClickCal.";
    return;
  }

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: readSelection,
  });

  const selection = injection.result;

  if (!selection) {
    hint.textContent = "Highlight some text on the page, then click ClickCal.";
    return;
  }

  hint.textContent = "Highlighted text:";
  capture.textContent = selection;
}

main();
