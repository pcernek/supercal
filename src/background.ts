import { IMessage } from './types';

// Function to get an OAuth token
async function getAuthToken(interactive = false): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
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
async function fetchCalendarEvents(timeMin: string, timeMax: string) {
  try {
    const token = await getAuthToken(true);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}`,
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

// Function to revoke OAuth token
async function revokeToken(token: string | undefined) {
  if (!token) {
    console.error('No token to revoke');
    return;
  }

  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  } catch (error) {
    console.error('Error revoking token:', error);
  }
}

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message: IMessage, _sender, sendResponse) => {
  if (message.action === 'getAuthToken') {
    getAuthToken(message.interactive)
      .then(token => {
        sendResponse({ success: true, token });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }

  if (message.action === 'getCalendarEvents') {
    Promise.all([
      fetchCalendarEvents(message.timeMin, message.timeMax),
      fetchColorDefinitions()
    ])
      .then(([events, colors]) => {
        sendResponse({
          success: true,
          data: events.items,
          colors: new Map(Object.entries(colors.event))
        });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }

  if (message.action === 'signOut') {
    getAuthToken(false)
      .then(token => {
        return revokeToken(token);
      })
      .then(() => {
        chrome.identity.clearAllCachedAuthTokens(() => {
          sendResponse({ success: true });
        });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }

  return false; // Will not respond asynchronously
}); 