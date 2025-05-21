let isEnabled = false;
let observer = null;

function removeNonEECS() {
  // Select all rows in the table
  const rows = document.querySelectorAll('._calculator_row');

  rows.forEach((row) => {
    // Find the "Subject" and "Course Code" columns in the current row
    const subjectCell = row.querySelector('td:nth-child(3)');
    const courseCodeCell = row.querySelector('td:nth-child(4)');
    const subjectText = subjectCell?.textContent.trim();
    const courseCode = courseCodeCell?.textContent.trim();

    // Check if it's non-EECS OR if it's an EECS course with second digit '5'
    if (
      (subjectText && !subjectText.includes("EECS")) || 
      (courseCode && /^\d{4}$/.test(courseCode) && courseCode[1] === '5')
    ) {
      // Find the "Remove course" button in the current row
      const removeButton = row.querySelector('button[aria-label="Remove course button"]');
      if (removeButton) {
        console.log("Removing:", subjectText, courseCode);
        removeButton.dispatchEvent(new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        }));
      } else {
        console.warn("No remove button for:", subjectText, courseCode);
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
