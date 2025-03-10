import { ICalendarEvent } from './fetchCalendarEvents';
import { IGetCalendarEventByIdPayload } from '../types';

export const getCalendarEventById = async (
  payload: IGetCalendarEventByIdPayload
): Promise<ICalendarEvent> => {
  try {
    const token = await getAuthToken();
    const { calendarId, eventId } = payload;

    // Use the specific Google Calendar API endpoint for fetching a single event
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar event: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching calendar event by ID:', error);
    throw error;
  }
};

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