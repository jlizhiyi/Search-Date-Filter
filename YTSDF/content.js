let lastUrl = location.href;

function modifySearch() {
  chrome.storage.sync.get(['enabled', 'exactSearch', 'cutoffDate', 'sortOrder'], (data) => {
    if (!data.enabled || !data.cutoffDate) return;
    
    const url = new URL(window.location.href);
    
    let queryParam = null;
    let query = null;
    
    if (url.hostname.includes('google.com')) {
      queryParam = 'q';
      query = url.searchParams.get('q');
    } else if (url.hostname.includes('youtube.com')) {
      queryParam = 'search_query';
      query = url.searchParams.get('search_query');
    }
    
    if (query && queryParam && !query.includes('before:')) {
      let newQuery = query;
      
      // Add exact search quotes if enabled
      if (data.exactSearch && !newQuery.startsWith('"')) {
        newQuery = `"${newQuery}"`;
      }
      
      // Add date filter
      newQuery = `before:${data.cutoffDate} ${newQuery}`;
      
      url.searchParams.set(queryParam, newQuery);
      
      // Add YouTube sort parameter if applicable
      if (url.hostname.includes('youtube.com') && data.sortOrder && data.sortOrder !== 'relevance') {
        if (data.sortOrder === 'date') {
          url.searchParams.set('sp', 'CAI%3D');
        } else if (data.sortOrder === 'viewCount') {
          url.searchParams.set('sp', 'CAM%3D');
        }
      }
      
      window.location.replace(url.toString());
    }
  });
}

// Intercept YouTube search form submission
function interceptYouTubeSearch() {
  chrome.storage.sync.get(['enabled', 'exactSearch', 'cutoffDate', 'sortOrder'], (data) => {
    if (!data.enabled || !data.cutoffDate) return;
    
    const checkSearchBox = setInterval(() => {
      const searchBox = document.querySelector('input#search');
      if (searchBox) {
        clearInterval(checkSearchBox);
        
        const form = searchBox.closest('form');
        if (form) {
          form.addEventListener('submit', (e) => {
            let currentQuery = searchBox.value;
            if (currentQuery && !currentQuery.includes('before:')) {
              e.preventDefault();
              
              // Add exact search quotes if enabled
              if (data.exactSearch && !currentQuery.startsWith('"')) {
                currentQuery = `"${currentQuery}"`;
              }
              
              searchBox.value = `before:${data.cutoffDate} ${currentQuery}`;
              
              // Add sort parameter to form action if needed
              if (data.sortOrder && data.sortOrder !== 'relevance') {
                const formAction = new URL(form.action);
                if (data.sortOrder === 'date') {
                  formAction.searchParams.set('sp', 'CAI%3D');
                } else if (data.sortOrder === 'viewCount') {
                  formAction.searchParams.set('sp', 'CAM%3D');
                }
                form.action = formAction.toString();
              }
              
              form.submit();
            }
          });
        }
      }
    }, 100);
    
    setTimeout(() => clearInterval(checkSearchBox), 5000);
  });
}

// Run on initial load
modifySearch();

// For YouTube homepage, intercept search form
if (location.hostname.includes('youtube.com')) {
  interceptYouTubeSearch();
}

// Watch for URL changes (for SPA navigation)
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    modifySearch();
  }
}).observe(document, { subtree: true, childList: true });