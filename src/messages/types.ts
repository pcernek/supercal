import { IGetAuthTokenPayload, IGetCalendarEventsPayload } from './handlers';

export enum MessageAction {
  GetAuthToken = 'getAuthToken',
  GetCalendarEvents = 'getCalendarEvents',
  SignOut = 'signOut',
}

export type IGenericMessage<T extends MessageAction, PayloadType> = {
  action: T;
  payload: PayloadType;
}

export type IMessagePayload = IGenericMessage<MessageAction.GetAuthToken, IGetAuthTokenPayload> | 
  IGenericMessage<MessageAction.GetCalendarEvents, IGetCalendarEventsPayload> | 
  IGenericMessage<MessageAction.SignOut, undefined>;

export interface ISuccessResponse<T> {
  success: true;
  data: T;
}

export interface IErrorResponse {
  success: false;
  error: string;
}

export type IMessageResponse<T> = ISuccessResponse<T> | IErrorResponse;
