import { IFetchCalendarColorsResponse, IFetchCalendarListResponse, IGetAuthTokenPayload, IGetAuthTokenResponse, IFetchCalendarEventsPayload, IFetchCalendarEventsResponse, ICalendarEvent } from './handlers';
import { IGenericMessage, IMessageResponse, MessageAction, IMessagePayload, IGetCalendarEventByIdPayload } from './types';

/**
 * MessageSender handles sending messages to the background script
 * and provides type-safe methods for each message type
 */
export class MessageSender {
  /**
   * Sends a message to the background script
   * @param message The message payload to send
   * @returns A promise that resolves to the response from the background script
   */
  private static async sendMessage<R>(message: IMessagePayload): Promise<IMessageResponse<R>> {
    return new Promise((resolve, reject) => {
      console.log('MessageSender: sendMessage', message);
      chrome.runtime.sendMessage(message, (response: IMessageResponse<R>) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (!response) {
          reject(new Error('No response received from background script'));
          return;
        }

        resolve(response);
      });
    });
  }

  /**
   * Requests an authentication token
   * @param interactive Whether to show an interactive login prompt if needed
   * @returns A promise that resolves to the auth token response
   */
  public static async getAuthToken(interactive = false): Promise<IMessageResponse<IGetAuthTokenResponse>> {
    const message: IGenericMessage<MessageAction.GetAuthToken, IGetAuthTokenPayload> = {
      action: MessageAction.GetAuthToken,
      payload: {
        interactive
      }
    };

    return this.sendMessage(message);
  }

  public static async fetchCalendarColors(): Promise<IMessageResponse<IFetchCalendarColorsResponse>> {
    return this.sendMessage({
      action: MessageAction.FetchCalendarColors,
      payload: undefined
    });
  }

  public static async fetchCalendarList(): Promise<IMessageResponse<IFetchCalendarListResponse>> {
    return this.sendMessage({
      action: MessageAction.FetchCalendarList,
      payload: undefined
    });
  }

  /**
   * Fetches calendar events for the specified time range
   * @param payload The payload containing timeMin, timeMax, and optional calendarId
   * @returns A promise that resolves to the calendar events response
   */
  public static async getCalendarEvents(payload: IFetchCalendarEventsPayload): Promise<IMessageResponse<IFetchCalendarEventsResponse>> {
    const message: IGenericMessage<MessageAction.GetCalendarEvents, IFetchCalendarEventsPayload> = {
      action: MessageAction.GetCalendarEvents,
      payload
    };

    return this.sendMessage(message);
  }

  /**
   * Fetches a specific calendar event by ID
   * @param calendarId The ID of the calendar containing the event (defaults to 'primary')
   * @param eventId The ID of the event to fetch
   * @returns A promise that resolves to the calendar event response
   */
  public static async getCalendarEventById(calendarId: string = 'primary', eventId: string): Promise<IMessageResponse<ICalendarEvent>> {
    const message: IGenericMessage<MessageAction.GetCalendarEventById, IGetCalendarEventByIdPayload> = {
      action: MessageAction.GetCalendarEventById,
      payload: {
        calendarId,
        eventId
      }
    };

    return this.sendMessage(message);
  }

  /**
   * Signs the user out by revoking the auth token
   * @returns A promise that resolves to the sign out response
   */
  public static async signOut(): Promise<IMessageResponse<void>> {
    return this.sendMessage({
      action: MessageAction.SignOut,
      payload: undefined
    });
  }
}
