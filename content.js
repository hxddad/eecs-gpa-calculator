let isEnabled = false;
let observer = null;
let debounceTimeout = null;

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function removeNonEECS() {
  const rows = document.querySelectorAll('._calculator_row');
  const processed = new Set();

  for (const row of rows) {
    // Faculty column 
    const FacultyCell = row.querySelector('td:nth-child(2)');
    // Subject column 
    const subjectCell = row.querySelector('td:nth-child(3)');
    // Course code column
    const codeCell = row.querySelector('td:nth-child(4)');
    // Course credits column
    const creditsCell = row.querySelector('td:nth-child(5)');

    // Extract the text content
    const subjectText = subjectCell?.textContent.trim();
    const codeText = codeCell?.textContent.trim();
    const FacultyText = FacultyCell?.textContent.trim();
    const creditsText = creditsCell?.textContent.trim();

    // Skip rows with missing subject or code
    if (!subjectText || !codeText) continue;

    // Use a unique key for each course (subject + code)
    const courseKey = `${subjectText}|${codeText}`;
    if (processed.has(courseKey)) continue;
    processed.add(courseKey);

    // Check if it's an EECS course
    if (subjectText.toUpperCase().includes("EECS")) {
      console.log("Keeping:", FacultyText + '/' + subjectText, codeText, '(' + creditsText + '.00' + ')');
    } else {
      // Not EECS: try to remove
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

    // Pause before processing the next row
    await sleep(100); // 100ms pause
  }
  updateOverlineText();
}

function debouncedRemoveNonEECS() {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(removeNonEECS, 100);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    isEnabled = request.enabled;
    
    if (isEnabled) {
      removeNonEECS();
      // Start observing
      if (!observer) {
        observer = new MutationObserver(() => {
          debouncedRemoveNonEECS();
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }
    } else {
      // Stop observing
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }
  }
});

// Check initial state
chrome.storage.sync.get('isEnabled', function(data) {
  isEnabled = data.isEnabled || false;
  if (isEnabled) {
    removeNonEECS();
    observer = new MutationObserver(() => {
      debouncedRemoveNonEECS();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
});
