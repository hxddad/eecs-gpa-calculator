let isEnabled = false;
let observer = null;
let debounceTimeout = null;
let alreadyProcessed = new Set();
let isRemoving = false;


function updateOverlineText() {
  document.querySelectorAll('.text-overline').forEach(el => {
    if (el.textContent.trim().toUpperCase() === 'SESSIONAL GPA') {
      el.textContent = 'SESSIONAL EECS GPA';
    }
    if (el.textContent.trim().toUpperCase() === 'CUMULATIVE GPA') {
      el.textContent = 'CUMULATIVE EECS GPA';
    }
  });
}

async function removeNonEECS() {
  if (isRemoving) return; // prevent overlap
  isRemoving = true;

  const rows = document.querySelectorAll('._calculator_row');
  console.log("[DEBUG] Found", rows.length, "rows to process");
  
  for (const row of rows) {
    const FacultyCell = row.querySelector('td:nth-child(2)');
    const subjectCell = row.querySelector('td:nth-child(3)');
    const codeCell = row.querySelector('td:nth-child(4)');
    const creditsCell = row.querySelector('td:nth-child(5)');

    const subjectText = subjectCell?.textContent.trim();
    const codeText = codeCell?.textContent.trim();
    const FacultyText = FacultyCell?.textContent.trim();
    const creditsText = creditsCell?.textContent.trim();

    if (!subjectText || !codeText) continue;

    const courseKey = `${subjectText}|${codeText}`;
    if (alreadyProcessed.has(courseKey)) continue;
    alreadyProcessed.add(courseKey);

    if (subjectText.toUpperCase().includes("EECS")) {
      console.log("Keeping:", FacultyText + '/' + subjectText, codeText, '(' + creditsText + '.00' + ')');
    } else {
      const removeButton = row.querySelector('button[aria-label="Remove course button"]');
      if (removeButton) {
        console.log("Removing:", FacultyText + '/' + subjectText, codeText, '(' + creditsText + '.00' + ')');
        removeButton.dispatchEvent(new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        }));
      } else {
        console.log("No remove button for:", FacultyText + '/' + subjectText, codeText, '(' + creditsText + '.00' + ')');
      }
    }
  }

  updateOverlineText();
  isRemoving = false;
}
  updateOverlineText();


function debouncedRemoveNonEECS() {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(removeNonEECS, 250); // increased debounce for safety
}

// Improved observer setup
function setupObserver() {
  const target = document.querySelector('.calculator-table') || document.body;
  observer = new MutationObserver(() => {
    debouncedRemoveNonEECS();
  });
  observer.observe(target, {
    childList: true,
    subtree: true,
  });
}

// Wait until rows are fully available before first run
function waitForRowsAndRun(callback, timeout = 5000) {
  const interval = 100;
  let elapsed = 0;
  const check = setInterval(() => {
    const rows = document.querySelectorAll('._calculator_row');
    if (rows.length > 0 || elapsed >= timeout) {
      clearInterval(check);
      callback();
    }
    elapsed += interval;
  }, interval);
}

// Listener from popup toggle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    isEnabled = request.enabled;

    if (isEnabled) {
      waitForRowsAndRun(() => {
        removeNonEECS();
        if (!observer) setupObserver();
      });
    } else {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }
  }
});

// Load-time auto-run
chrome.storage.sync.get('isEnabled', function(data) {
  isEnabled = data.isEnabled || false;
  if (isEnabled) {
    waitForRowsAndRun(() => {
      removeNonEECS();
      setupObserver();
    });
  }
});

// Fallback: run after full window load as well
window.addEventListener('load', () => {
  setTimeout(() => {
    if (isEnabled) {
      removeNonEECS();
    }
  }, 1000);
});
