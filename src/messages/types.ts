/**
 * TODO:
 *  - each message handler should ideally define its own types
 *  - also its own response types
 *  - maybe instead of an enum 
 */

export enum MessageAction {
  GetAuthToken = 'getAuthToken',
  GetCalendarEvents = 'getCalendarEvents',
  SignOut = 'signOut',
}

// Base message payload type
export interface IBaseMessagePayload {
  action: MessageAction;
}

// Specific payload types
export interface IGetAuthTokenPayload extends IBaseMessagePayload {
  action: MessageAction.GetAuthToken;
  interactive?: boolean;
}

export interface IGetCalendarEventsPayload extends IBaseMessagePayload {
  action: MessageAction.GetCalendarEvents;
  timeMin: string;
  timeMax: string;
}

export interface ISignOutPayload extends IBaseMessagePayload {
  action: MessageAction.SignOut;
}

// Union type of all possible payloads
export type MessagePayload =
  | IGetAuthTokenPayload
  | IGetCalendarEventsPayload
  | ISignOutPayload;

export interface IMessageResponse {
  success: boolean;
  [key: string]: any;
}

// Message handler function type - returns a Promise of IMessageResponse
export type MessageHandler<T extends IBaseMessagePayload> =
  (payload: T) => Promise<IMessageResponse>;

// Type guard functions
export function isGetAuthTokenPayload(payload: MessagePayload): payload is IGetAuthTokenPayload {
  return payload.action === MessageAction.GetAuthToken;
}

export function isGetCalendarEventsPayload(payload: MessagePayload): payload is IGetCalendarEventsPayload {
  return payload.action === MessageAction.GetCalendarEvents;
}

export function isSignOutPayload(payload: MessagePayload): payload is ISignOutPayload {
  return payload.action === MessageAction.SignOut;
}

