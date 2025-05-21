document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const statusText = document.getElementById('status');

  // Get current state from storage
  chrome.storage.sync.get('isEnabled', function(data) {
    toggleSwitch.checked = data.isEnabled || false;
    statusText.textContent = `Extension is ${data.isEnabled ? 'ON' : 'OFF'}`;
  });

  toggleSwitch.addEventListener('change', function() {
    const isEnabled = toggleSwitch.checked;
    
    // Save state to storage
    chrome.storage.sync.set({ isEnabled: isEnabled });
    
    // Update status text
    statusText.textContent = `Extension is ${isEnabled ? 'ON' : 'OFF'}`;

    // Send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggle',
        enabled: isEnabled
      });
    });
  });
});