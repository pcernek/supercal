document.addEventListener('DOMContentLoaded', () => {
  const authStatus = document.getElementById('auth-status');
  const authButton = document.getElementById('auth-button');
  const signoutButton = document.getElementById('signout-button');

  // Check if user is authenticated
  checkAuthStatus();

  // Add event listeners
  authButton.addEventListener('click', authenticate);
  signoutButton.addEventListener('click', signOut);

  function checkAuthStatus() {
    chrome.runtime.sendMessage({ action: 'getAuthToken', interactive: false }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        // Not authenticated
        authStatus.textContent = 'You need to sign in to access your Google Calendar data.';
        authStatus.className = 'status';
        authButton.classList.remove('hidden');
        signoutButton.classList.add('hidden');
      } else {
        // Authenticated
        authStatus.textContent = 'You are signed in to Google Calendar.';
        authStatus.className = 'status success';
        authButton.classList.add('hidden');
        signoutButton.classList.remove('hidden');
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

        // Notify content script that authentication was successful
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].url.includes('calendar.google.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'authStatusChanged',
              status: 'authenticated'
            });
          }
        });
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
      } else {
        authStatus.textContent = 'Failed to sign out. Please try again.';
        authStatus.className = 'status error';
      }
    });
  }
}); 