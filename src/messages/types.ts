import { IGetAuthTokenPayload, IFetchCalendarEventsPayload } from './handlers';

export interface IGetCalendarEventByIdPayload {
  calendarId: string;
  eventId: string;
}

export enum MessageAction {
  FetchCalendarColors = 'fetchCalendarColors',
  FetchCalendarList = 'fetchCalendarList',
  GetAuthToken = 'getAuthToken',
  GetCalendarEvents = 'getCalendarEvents',
  GetCalendarEventById = 'getCalendarEventById',
  SignOut = 'signOut',
}

export type IGenericMessage<T extends MessageAction, PayloadType> = {
  action: T;
  payload: PayloadType;
}

export type IMessagePayload = IGenericMessage<MessageAction.GetAuthToken, IGetAuthTokenPayload> |
  IGenericMessage<MessageAction.FetchCalendarColors, undefined> |
  IGenericMessage<MessageAction.FetchCalendarList, undefined> |
  IGenericMessage<MessageAction.GetCalendarEvents, IFetchCalendarEventsPayload> |
  IGenericMessage<MessageAction.GetCalendarEventById, IGetCalendarEventByIdPayload> |
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
