function removeNonEECS() {
  // Select all rows in the table
  const rows = document.querySelectorAll('._calculator_row');

  rows.forEach((row) => {
    // Find the "Subject" column in the current row
    const subjectCell = row.querySelector('td:nth-child(3)'); // Adjust this selector if needed
    const subjectText = subjectCell?.textContent.trim();

    if (subjectText && !subjectText.includes("EECS")) {
      // Find the "Remove course" button in the current row
      const removeButton = row.querySelector('button[aria-label="Remove course button"]');
      if (removeButton) {
        console.log("Removing:", subjectText);
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

// Run once now
removeNonEECS();

// Optional: Run again when DOM 
const observer = new MutationObserver(() => {
  removeNonEECS();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
