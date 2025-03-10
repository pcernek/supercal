export function isValidCalendarView(url: string): boolean {
  return url.includes('/week') || url.includes('/day');
}
