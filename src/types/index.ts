export interface IColorInfo {
  id: string;
  background: string;
  foreground: string;
}

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

export interface IPanelOptions {
  isCollapsed: boolean;
  grandTotal: number;
  sortedColors: [string, number][];
  colorMap: Map<string, IColorInfo>;
  colorIdToRgb: Map<string, string>;
}

export interface IPanelState {
  top: number;
  left: number;
  collapsed: boolean;
}

export interface IChromeResponse {
  success: boolean;
  data?: any;
  error?: string;
} 