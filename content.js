let isEnabled = false;
let observer = null;

function removeNonEECS() {
  // Select all rows in the table
  const rows = document.querySelectorAll('._calculator_row');

  rows.forEach((row) => {
    // Subject column 
    const subjectCell = row.querySelector('td:nth-child(3)');
    // Course code column
    const codeCell = row.querySelector('td:nth-child(4)');

    // Extract the text content
    const subjectText = subjectCell?.textContent.trim();
    const codeText = codeCell?.textContent.trim();

    // Check if it's non-EECS and if the text is not empty 
    // (print removed course name and code into console, ex. PHYS 2020)
    if (
      (subjectText && !subjectText.includes("EECS"))
    ) {
      // Find the "Remove course" button in the current row
      const removeButton = row.querySelector('button[aria-label="Remove course button"]');
      if (removeButton) {
        console.log("Removing:", subjectText, codeText);
        // Click the "Remove course" buttons
        removeButton.dispatchEvent(new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        }));
      } else {
        console.warn("No remove button for:", subjectText);
      }
    }
  });
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
          removeNonEECS();
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
      removeNonEECS();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
});
