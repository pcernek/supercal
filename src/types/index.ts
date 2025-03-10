export interface IDateRange {
  startDate: Date;
  endDate: Date;
}

export interface IChromeResponse {
  success: boolean;
  data?: any;
  error?: string;
} 