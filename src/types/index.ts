export interface ICalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  colorId: string;
}

export interface IDateRange {
  startDate: Date;
  endDate: Date;
}

export interface IChromeResponse {
  success: boolean;
  data?: any;
  error?: string;
} 