import {
  IMessageResponse,
  ISuccessResponse,
  IErrorResponse,
  IMessagePayload,
} from './types';
import { getAuthTokenHandler, fetchCalendarColors, signOutHandler } from './handlers';

const successResponse = <T>(data: T): ISuccessResponse<T> => ({ success: true, data });
const errorResponse = (error: string): IErrorResponse => ({ success: false, error });

export class MessageRouter {
  public static async handleMessage(message: IMessagePayload): Promise<IMessageResponse<unknown>> {
    try {
      switch (message.action) {
        case 'getAuthToken':
          return successResponse(await getAuthTokenHandler(message.payload));

        case 'fetchCalendarColors':
          return successResponse(await fetchCalendarColors());

        case 'signOut':
          return successResponse(await signOutHandler());

        default:
          return errorResponse(`Unknown action: ${(message as any).action}`);
      }
    } catch (error) {
      console.error('Error in message handler:', error);
      return errorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
