let isEnabled = false;
let observer = null;

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

function removeNonEECS() {
  // Select all rows in the table
  const rows = document.querySelectorAll('._calculator_row');

  rows.forEach((row) => {
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

    // Check if it's non-EECS and if the text is not empty 
    // (print removed course name and code into console, ex. PHYS 2020)
    if (
      (subjectText && !subjectText.includes("EECS"))
    ) {
      // Find the "Remove course" button in the current row
      const removeButton = row.querySelector('button[aria-label="Remove course button"]');
      if (removeButton) {
        console.log("Removing:",  FacultyText + '/' + subjectText, codeText, '(' + creditsText + '.00' + ')');
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
  updateOverlineText();
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
