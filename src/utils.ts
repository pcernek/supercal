import { IDateRange } from './types';

export function formatDuration(minutes: number): string {
  const hours = minutes / 60;
  return `${hours.toFixed(2)} h`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function areDateRangesSame(range1: IDateRange, range2: IDateRange): boolean {
  if (!range1 || !range2 || !range1.startDate || !range2.startDate || !range1.endDate || !range2.endDate) {
    return false;
  }

  return range1.startDate.getTime() === range2.startDate.getTime() &&
    range1.endDate.getTime() === range2.endDate.getTime();
}

export function detectVisibleDateRange(): IDateRange {
  // Try to find the date range from the UI
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  // Check if we're in week view
  const weekViewHeader = document.querySelector('h2[data-daterange]');
  if (weekViewHeader) {
    const dateRange = weekViewHeader.getAttribute('data-daterange');
    if (dateRange) {
      const dates = dateRange.split('–').map(d => d.trim());
      if (dates.length === 2) {
        // Parse the dates - format might be like "Feb 25 – Mar 2, 2024"
        const year = new Date().getFullYear();
        const fullDateRange = dates[1].includes(',') ?
          dates[1].split(',')[1].trim() : year.toString();

        startDate = new Date(`${dates[0]} ${fullDateRange}`);
        endDate = new Date(`${dates[1]}`);

        // Add one day to end date to include the full day
        endDate.setDate(endDate.getDate() + 1);
      }
    }
  }

  // If we couldn't detect from the UI, use current week as fallback
  if (!startDate || !endDate) {
    const today = new Date();
    startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay()); // Sunday
    endDate = new Date(today);
    endDate.setDate(startDate.getDate() + 7); // Next Sunday
  }

  return { startDate, endDate };
} 