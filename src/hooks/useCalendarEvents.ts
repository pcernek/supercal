import { useState, useEffect } from 'react';

interface ICalendarEvent {
  color: string;
  durationMinutes: number;
}

/**
 * Converts RGB color format to hex color code
 * @param rgbColor - RGB color string in format 'rgb(r, g, b)' or 'rgba(r, g, b, a)'
 * @returns Hex color code in format '#RRGGBB'
 */
const rgbToHex = (rgbColor: string): string => {
  // Extract RGB values using regex
  const rgbMatch = rgbColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);

  if (!rgbMatch) {
    return '#000000'; // Default to black if format doesn't match
  }

  // Convert RGB components to hex
  const r = parseInt(rgbMatch[1], 10);
  const g = parseInt(rgbMatch[2], 10);
  const b = parseInt(rgbMatch[3], 10);

  // Ensure values are in valid range
  const validR = Math.max(0, Math.min(255, r));
  const validG = Math.max(0, Math.min(255, g));
  const validB = Math.max(0, Math.min(255, b));

  // Convert to hex and pad with zeros if needed
  return `#${validR.toString(16).padStart(2, '0')}${validG.toString(16).padStart(2, '0')}${validB.toString(16).padStart(2, '0')}`;
};

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<ICalendarEvent[]>([]);

  useEffect(() => {
    const eventElements = document.querySelectorAll('div[data-eventid]');
    const calendarEvents: ICalendarEvent[] = [];

    eventElements.forEach((element) => {
      // Extract the color and convert from RGB to hex
      const computedStyle = window.getComputedStyle(element);
      const rgbColor = computedStyle.backgroundColor || 'rgb(0, 0, 0)';
      const color = rgbToHex(rgbColor);

      // Extract duration from a child div containing time range text
      let durationMinutes = 0;
      const timeRangeElements = element.querySelectorAll('div');

      for (const timeElement of timeRangeElements) {
        const timeText = timeElement.textContent;
        if (timeText && /\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}/.test(timeText)) {
          // Extract start and end times
          const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);

          if (timeMatch) {
            const startHour = parseInt(timeMatch[1], 10);
            const startMinute = parseInt(timeMatch[2], 10);
            const endHour = parseInt(timeMatch[3], 10);
            const endMinute = parseInt(timeMatch[4], 10);

            // Calculate total minutes
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;

            // Handle cases where the event crosses midnight
            durationMinutes = endTotalMinutes >= startTotalMinutes
              ? endTotalMinutes - startTotalMinutes
              : (24 * 60 - startTotalMinutes) + endTotalMinutes;

            break; // Found the time range, no need to continue searching
          }
        }
      }

      calendarEvents.push({
        color,
        durationMinutes
      });
    });

    setEvents(calendarEvents);
  }, []);

  return events;
};
