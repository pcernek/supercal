export interface IGetCalendarEventsPayload {
  timeMin: string;
  timeMax: string;
}

export interface IGetCalendarEventsResponse {
  events: unknown[]; // TODO
  colors: Map<string, unknown>; // TODO
}

export const getCalendarEventsHandler = async (
  payload: IGetCalendarEventsPayload
): Promise<IGetCalendarEventsResponse> => {
  const [events, colors] = await Promise.all([
    fetchCalendarEvents(payload.timeMin, payload.timeMax),
    fetchColorDefinitions()
  ]);

  return {
    events,
    colors
  };
};

async function fetchColorDefinitions() {
  try {
    const token = await getAuthToken();
    const response = await fetch('https://www.googleapis.com/calendar/v3/colors', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch color definitions: ${response.status}`);
    }

    const data = await response.json();
    // Use event colors instead of calendar colors
    return new Map(Object.entries(data.event));
  } catch (error) {
    console.error('Error fetching color definitions:', error);
    throw error;
  }
}

async function fetchCalendarEvents(timeMin: string, timeMax: string) {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`,
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
    return data.items;
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