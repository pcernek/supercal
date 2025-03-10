export interface IFetchCalendarEventsPayload {
  timeMin: Date;
  timeMax: Date;
  calendarId?: string;
}

export interface ICalendarEvent {
  id: string;
  summary: string;
  start: {
    date: string;
    dateTime: string;
    timeZone: string;
  };
  end: {
    date: string;
    dateTime: string;
    timeZone: string;
  };
  colorId: string;
  htmlLink: string
}

export interface IFetchCalendarEventsResponse {
  events: ICalendarEvent[];
}

export const fetchCalendarEvents = async (
  payload: IFetchCalendarEventsPayload
): Promise<IFetchCalendarEventsResponse> => {
  try {
    const token = await getAuthToken();
    const calendarId = payload.calendarId || 'primary';
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${payload.timeMin}&timeMax=${payload.timeMax}&singleEvents=true&maxResults=2500`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar events: ${response.status}`);
    }

    const data = await response.json();
    return { events: data.items };
  } catch (error) {
    console.error('Error fetching calendar events:', error);
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