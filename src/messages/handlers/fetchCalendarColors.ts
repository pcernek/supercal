export interface ICalendarColors {
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

export interface IFetchCalendarColorsResponse {
  colors: ICalendarColors;
}

export const fetchCalendarColors = async (): Promise<IFetchCalendarColorsResponse> => {
  const colors = await fetchColorDefinitions();

  return {
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

    return response.json();
  } catch (error) {
    console.error('Error fetching color definitions:', error);
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