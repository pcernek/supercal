export interface ICalendarList {
  kind: string;
  etag: string;
  id: string;
  summary: string;
  description: string;
  location: string;
  timeZone: string;
  summaryOverride: string;
  colorId: string,
  "backgroundColor": string,
  "foregroundColor": string,
  "hidden": boolean,
  "selected": boolean,
  "accessRole": string,
  defaultReminders: [
    {
      method: string;
      minutes: number;
    }
  ],
  notificationSettings: {
    notifications: [
      {
        "type": string,
        "method": string
      }
    ]
  },
  "primary": boolean,
  "deleted": boolean,
  "conferenceProperties": {
    "allowedConferenceSolutionTypes": [
      string
    ]
  }
}

export interface IFetchCalendarListResponse {
  items: ICalendarList[];
}

export const fetchCalendarList = async (): Promise<IFetchCalendarListResponse> => {
  try {
    const token = await getAuthToken();
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=100', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar list: ${response.status}`);
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching calendar list:', error);
    throw error;
  }
}

async function getAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!token) {
        reject(new Error('No auth token available'));
        return;
      }
      resolve(token);
    });
  });
} 