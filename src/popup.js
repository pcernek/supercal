document.addEventListener('DOMContentLoaded', () => {
  const authStatus = document.getElementById('auth-status');
  const authButton = document.getElementById('auth-button');
  const signoutButton = document.getElementById('signout-button');
  const fetchButton = document.getElementById('fetch-button');
  const dateSelector = document.getElementById('date-selector');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');

  // Set default date range (current week)
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  const endOfWeek = new Date(today);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

  startDateInput.value = formatDate(startOfWeek);
  endDateInput.value = formatDate(endOfWeek);

  // Check if user is authenticated
  checkAuthStatus();

  // Add event listeners
  authButton.addEventListener('click', authenticate);
  signoutButton.addEventListener('click', signOut);
  fetchButton.addEventListener('click', fetchCalendarData);

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function checkAuthStatus() {
    chrome.runtime.sendMessage({ action: 'getAuthToken', interactive: false }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        // Not authenticated
        authStatus.textContent = 'You need to sign in to access your Google Calendar data.';
        authStatus.className = 'status';
        authButton.classList.remove('hidden');
        signoutButton.classList.add('hidden');
        fetchButton.classList.add('hidden');
        dateSelector.classList.add('hidden');
      } else {
        // Authenticated
        authStatus.textContent = 'You are signed in to Google Calendar.';
        authStatus.className = 'status success';
        authButton.classList.add('hidden');
        signoutButton.classList.remove('hidden');
        fetchButton.classList.remove('hidden');
        dateSelector.classList.remove('hidden');
      }
    });
  }

  function authenticate() {
    authStatus.textContent = 'Signing in...';
    authStatus.className = 'status';

    chrome.runtime.sendMessage({ action: 'getAuthToken', interactive: true }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        authStatus.textContent = 'Authentication failed. Please try again.';
        authStatus.className = 'status error';
      } else {
        authStatus.textContent = 'Successfully signed in!';
        authStatus.className = 'status success';
        authButton.classList.add('hidden');
        signoutButton.classList.remove('hidden');
        fetchButton.classList.remove('hidden');
        dateSelector.classList.remove('hidden');
      }
    });
  }

  function signOut() {
    authStatus.textContent = 'Signing out...';
    authStatus.className = 'status';

    chrome.runtime.sendMessage({ action: 'signOut' }, (response) => {
      if (response && response.success) {
        authStatus.textContent = 'You have been signed out.';
        authStatus.className = 'status';
        authButton.classList.remove('hidden');
        signoutButton.classList.add('hidden');
        fetchButton.classList.add('hidden');
        dateSelector.classList.add('hidden');
      } else {
        authStatus.textContent = 'Failed to sign out. Please try again.';
        authStatus.className = 'status error';
      }
    });
  }

  function fetchCalendarData() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    // Add one day to end date to include the full day
    endDate.setDate(endDate.getDate() + 1);

    authStatus.textContent = 'Fetching calendar data...';
    authStatus.className = 'status';

    chrome.runtime.sendMessage({
      action: 'getCalendarEvents',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString()
    }, (response) => {
      if (response && response.success) {
        authStatus.textContent = `Successfully fetched ${response.data.items.length} events.`;
        authStatus.className = 'status success';

        // Send data to content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].url.includes('calendar.google.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'processCalendarData',
              data: response.data
            });
          } else {
            authStatus.textContent = 'Please navigate to Google Calendar to see the results.';
          }
        });
      } else {
        authStatus.textContent = 'Failed to fetch calendar data. Please try again.';
        authStatus.className = 'status error';
      }
    });
  }
}); 