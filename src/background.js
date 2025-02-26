// Google OAuth2 configuration
const AUTH_CONFIG = {
  client_id: chrome.runtime.getManifest().oauth2.client_id,
  scopes: chrome.runtime.getManifest().oauth2.scopes,
  redirect_uri: chrome.identity.getRedirectURL()
};

// Function to get an OAuth token
async function getAuthToken(interactive = false) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(token);
    });
  });
}

// Function to fetch color definitions from Google Calendar API
async function fetchColorDefinitions() {
  try {
    const token = await getAuthToken(true);

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/colors',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching color definitions:', error);
    throw error;
  }
}

// Function to fetch calendar events
async function fetchCalendarEvents(timeMin, timeMax) {
  try {
    const token = await getAuthToken(true);

    // Format dates for API
    const formattedTimeMin = timeMin.toISOString();
    const formattedTimeMax = timeMax.toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${formattedTimeMin}&timeMax=${formattedTimeMax}&singleEvents=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

// Function to revoke token
function revokeToken(token) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://accounts.google.com/o/oauth2/revoke?token=${token}`);
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject(new Error(`Failed to revoke token: ${xhr.statusText}`));
      }
    };
    xhr.onerror = () => {
      reject(new Error('Network error occurred'));
    };
    xhr.send();
  });
}

// Function to sign out
async function signOut() {
  try {
    const token = await getAuthToken();
    await revokeToken(token);
    chrome.identity.removeCachedAuthToken({ token });
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
}

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getAuthToken') {
    getAuthToken(request.interactive)
      .then(token => {
        sendResponse({ success: true, token });
      })
      .catch(error => {
        console.error('Auth error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indicates we will send a response asynchronously
  }

  if (request.action === 'getCalendarEvents') {
    const timeMin = new Date(request.timeMin);
    const timeMax = new Date(request.timeMax);

    // First fetch color definitions, then fetch events
    fetchColorDefinitions()
      .then(colorData => {
        return fetchCalendarEvents(timeMin, timeMax)
          .then(eventData => {
            sendResponse({
              success: true,
              data: eventData,
              colors: colorData
            });
          });
      })
      .catch(error => sendResponse({ success: false, error: error.message }));

    return true; // Indicates we will send a response asynchronously
  }

  if (request.action === 'getColorDefinitions') {
    fetchColorDefinitions()
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));

    return true; // Indicates we will send a response asynchronously
  }

  if (request.action === 'signOut') {
    signOut()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));

    return true;
  }
});

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open options page on install to guide setup
    chrome.tabs.create({ url: 'options.html' });
  }
}); 