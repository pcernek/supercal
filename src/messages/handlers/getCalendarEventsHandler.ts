export interface IGetCalendarEventsPayload {
  timeMin: string;
  timeMax: string;
}

// export interface ICalendar {
//   kind: string;
//   etag: string;
//   id: string;
//   summary: string;
//   description: string;
//   location: string;
//   timeZone: string;
//   conferenceProperties: {
//     allowedConferenceSolutionTypes: string[];
//   };
// }

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

export interface ICalendarColors2 {
  kind: string;
  updated: Date;
  calendar: {
    [key: string]: {
      background: string;
      foreground: string;
    }
  },
  event: {
    [key: string]: {
      background: string;
      foreground: string;
    }
  }
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
}

export interface IGetCalendarEventsResponse {
  events: ICalendarEvent[];
  colors: ICalendarColors2;
  calendarList: ICalendarList;
}

export const getCalendarEventsHandler = async (
  payload: IGetCalendarEventsPayload
): Promise<IGetCalendarEventsResponse> => {
  const [events, colors, calendarList] = await Promise.all([
    fetchCalendarEvents(payload.timeMin, payload.timeMax),
    fetchColorDefinitions(),
    fetchCalendarList()
  ]);

  return {
    events,
    colors,
    calendarList
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

    return response.json();
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

async function fetchCalendarList(): Promise<ICalendarList> {
  try {
    const token = await getAuthToken();
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calendars: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching calendars:', error);
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