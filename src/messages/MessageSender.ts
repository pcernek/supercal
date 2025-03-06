import {
  MessageAction,
  MessagePayload,
  IMessageResponse,
  IGetAuthTokenPayload,
  IGetCalendarEventsPayload,
  ISignOutPayload
} from './types';

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
  private static async sendMessage<T extends MessagePayload>(message: T): Promise<IMessageResponse> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response: IMessageResponse) => {
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
  public static async getAuthToken(interactive = false): Promise<IMessageResponse> {
    const message: IGetAuthTokenPayload = {
      action: MessageAction.GetAuthToken,
      interactive
    };

    return this.sendMessage(message);
  }

  /**
   * Fetches calendar events for the specified time range
   * @param timeMin The start time for the event range (ISO string)
   * @param timeMax The end time for the event range (ISO string)
   * @returns A promise that resolves to the calendar events response
   */
  public static async getCalendarEvents(timeMin: string, timeMax: string): Promise<IMessageResponse> {
    const message: IGetCalendarEventsPayload = {
      action: MessageAction.GetCalendarEvents,
      timeMin,
      timeMax
    };

    return this.sendMessage(message);
  }

  /**
   * Signs the user out by revoking the auth token
   * @returns A promise that resolves to the sign out response
   */
  public static async signOut(): Promise<IMessageResponse> {
    const message: ISignOutPayload = {
      action: MessageAction.SignOut
    };

    return this.sendMessage(message);
  }
} 