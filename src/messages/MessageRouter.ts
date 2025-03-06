import {
  MessageAction,
  MessagePayload,
  IMessageResponse,
} from './types';
import { getAuthTokenHandler } from './getAuthTokenHandler';
import { getCalendarEventsHandler } from './getCalendarEventsHandler';
import { signOutHandler } from './signOutHandler';

export class MessageRouter {
  public static async handleMessage(message: MessagePayload): Promise<IMessageResponse> {
    try {
      switch (message.action) {
        case MessageAction.GetAuthToken:
          return await getAuthTokenHandler(message);

        case MessageAction.GetCalendarEvents:
          return await getCalendarEventsHandler(message);

        case MessageAction.SignOut:
          return await signOutHandler(message);

        default:
          return {
            success: false,
            error: `Unknown action: ${(message as any).action}`
          };
      }
    } catch (error) {
      console.error('Error in message handler:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
