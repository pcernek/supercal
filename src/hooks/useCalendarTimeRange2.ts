import { useState, useEffect } from 'react';
import { useUrl } from './useUrl';
import { addDays, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';

/**
 * Hook that queries the DOM for the first and last elements with data-eventid attribute
 * and fetches the corresponding events from Google Calendar API
 */
export function useCalendarTimeRange2() {
  console.log('useCalendarTimeRange2');

  const [timeMin, setTimeMin] = useState<Date | null>(null);
  const [timeMax, setTimeMax] = useState<Date | null>(null);

  // Track URL changes
  const currentUrl = useUrl();

  useEffect(() => {
    // Function to parse the heading and extract date information
    const parseHeadingAndSetDates = () => {
      const headingElement = document.querySelector('h1[aria-label]');

      if (!headingElement) {
        console.log('No heading element found');
        return;
      }

      const ariaLabel = headingElement.getAttribute('aria-label') || '';
      // Try to match week format first: "Week of March 3, 2025, 76 events"
      const weekRegex = /Week of ([A-Za-z]+) (\d+), (\d{4})/;
      // Alternative day format: "Sunday, March 9, 2025, today, 9 events"
      const dayRegex = /([A-Za-z]+), ([A-Za-z]+) (\d+), (\d{4})/;

      let match = ariaLabel.match(weekRegex);
      let isWeekView = true;

      if (!match) {
        // Try the day format if week format doesn't match
        match = ariaLabel.match(dayRegex);
        isWeekView = false;

        if (!match) {
          console.log('Could not parse date from aria-label:', ariaLabel);
          return;
        }
      }

      // Extract month, day, year based on the matched format
      let month, day, year;

      if (isWeekView) {
        [, month, day, year] = match;
      } else {
        // For day format, skip the day of week (e.g., "Sunday")
        [, , month, day, year] = match;
      }

      // Convert month name to month index (0-11)
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const monthIndex = monthNames.findIndex(
        m => m.toLowerCase() === month.toLowerCase()
      );

      if (monthIndex === -1) {
        console.log('Invalid month name:', month);
        return;
      }

      // Create start date (timeMin) at 00:00 local time
      let startDate = new Date(
        parseInt(year),
        monthIndex,
        parseInt(day)
      );

      // Set time to 00:00:00.000 using date-fns
      startDate = setHours(startDate, 0);
      startDate = setMinutes(startDate, 0);
      startDate = setSeconds(startDate, 0);
      startDate = setMilliseconds(startDate, 0);

      // Create end date (timeMax) based on view type using date-fns
      let endDate;

      if (isWeekView) {
        // For week view, set timeMax to 7 days later
        endDate = addDays(startDate, 7);
      } else {
        // For day view, set timeMax to end of the same day (23:59:59.999)
        endDate = addDays(startDate, 1);
      }

      setTimeMin(startDate);
      setTimeMax(endDate);

      console.log('Parsed dates:', startDate, endDate, 'isWeekView:', isWeekView);
    };

    parseHeadingAndSetDates();
  }, [currentUrl]);

  return {
    timeMin,
    timeMax
  };
}
