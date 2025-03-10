import {
  IMessageResponse,
  ISuccessResponse,
  IErrorResponse,
  IMessagePayload,
  MessageAction,
} from './types';
import {
  getAuthTokenHandler,
  fetchCalendarColors,
  signOutHandler,
  fetchCalendarList,
  fetchCalendarEvents,
  getCalendarEventById
} from './handlers';

const successResponse = <T>(data: T): ISuccessResponse<T> => ({ success: true, data });
const errorResponse = (error: string): IErrorResponse => ({ success: false, error });

export class MessageRouter {
  public static async handleMessage(message: IMessagePayload): Promise<IMessageResponse<unknown>> {
    console.log('MessageRouter: handleMessage', message);
    try {
      switch (message.action) {
        case MessageAction.GetAuthToken:
          return successResponse(await getAuthTokenHandler(message.payload));

        case MessageAction.FetchCalendarColors:
          return successResponse(await fetchCalendarColors());

        case MessageAction.FetchCalendarList:
          return successResponse(await fetchCalendarList());

        case MessageAction.GetCalendarEvents:
          return successResponse(await fetchCalendarEvents(message.payload));

        case MessageAction.GetCalendarEventById:
          return successResponse(await getCalendarEventById(message.payload));

        case MessageAction.SignOut:
          return successResponse(await signOutHandler());

        default:
          console.error('MessageRouter: unknown action', message);
          return errorResponse(`Unknown action: ${(message as any).action}`);
      }
    } catch (error) {
      console.error('Error in message handler:', error);
      return errorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
