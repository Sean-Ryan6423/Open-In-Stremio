// Load saved settings
chrome.storage.sync.get({ showAnimePanelButton: true }, (settings) => {
  document.getElementById('animePanelToggle').checked = settings.showAnimePanelButton;
});

// Save settings on toggle
document.getElementById('animePanelToggle').addEventListener('change', (e) => {
  chrome.storage.sync.set({ showAnimePanelButton: e.target.checked });
});
