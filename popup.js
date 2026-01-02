document.getElementById('save').addEventListener('click', () => {
  const enabled = document.getElementById('enabled').checked;
  const exactSearch = document.getElementById('exactSearch').checked;
  const date = document.getElementById('cutoffDate').value;
  const sortOrder = document.querySelector('input[name="sortOrder"]:checked').value;
  
  chrome.storage.sync.set({ 
    enabled, 
    exactSearch,
    cutoffDate: date,
    sortOrder
  }, () => {
    alert('Settings saved!');
  });
});

// Load saved settings
chrome.storage.sync.get(['enabled', 'exactSearch', 'cutoffDate', 'sortOrder'], (data) => {
  document.getElementById('enabled').checked = data.enabled || false;
  document.getElementById('exactSearch').checked = data.exactSearch || false;
  document.getElementById('cutoffDate').value = data.cutoffDate || '';
  
  // Set sort order radio button
  const sortOrder = data.sortOrder || 'relevance';
  document.querySelector(`input[name="sortOrder"][value="${sortOrder}"]`).checked = true;
});