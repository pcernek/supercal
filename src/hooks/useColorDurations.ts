import { useMemo } from 'react';
import { sortBy } from 'lodash-es';
import { ICalendarEventParsed } from './useCalendarEvents2';
import { useCalendarTimeRange2 } from './useCalendarTimeRange2';
import { useCalendarEvents3 } from './useCalendarEvents3';

export interface IColorDuration {
  color: string;  // RGB color string
  label?: string;  // Display name for the color
  value: number;  // Minutes value
}

export const useColorDurations = () => {
  // Get the time range from DOM elements with data-eventid
  // const { timeRange, isLoading: isLoadingTimeRange, error: timeRangeError } = useCalendarTimeRange2();
  const timeRange = useCalendarTimeRange2();

  // Add debug logging for timeRange
  console.log('useColorDurations: timeRange', timeRange);

  // Create default dates if timeRange values are null
  const defaultTimeMin = new Date();
  const defaultTimeMax = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  // Fetch calendar events for the time range
  const { events: calendarEvents, isLoading: isLoadingEvents, error: eventsError } =
    useCalendarEvents3(
      timeRange.timeMin || defaultTimeMin,
      timeRange.timeMax || defaultTimeMax
    );

  // Log the actual dates being used
  console.log('useColorDurations: using dates',
    'timeMin:', timeRange.timeMin || defaultTimeMin,
    'timeMax:', timeRange.timeMax || defaultTimeMax);

  const isLoading = isLoadingEvents;
  const error = eventsError;

  const colorDurations = useMemo(() => {
    if (isLoading || error || !calendarEvents) {
      console.log('useColorDurations: no calendar events', isLoading, error, calendarEvents);
      return [];
    }

    console.log('useColorDurations: calendarEvents', calendarEvents);

    // Create a map to aggregate durations by color
    const durationsByColor: Map<string, { total: number, calendarNames: Set<string> }> = new Map();

    // Process all calendar events
    calendarEvents.forEach((event: ICalendarEventParsed) => {
      const { hexColor, durationMinutes, calendarSummary } = event;

      // Get or create the entry for this color
      const colorData = durationsByColor.get(hexColor) || { total: 0, calendarNames: new Set<string>() };

      // Add duration to the total
      colorData.total += durationMinutes;

      // Add calendar name to the set if available
      if (calendarSummary) {
        colorData.calendarNames.add(calendarSummary);
      }

      // Update the map
      durationsByColor.set(hexColor, colorData);
    });

    // Convert map to array of IColorDuration objects
    return sortBy(
      Array.from(durationsByColor.entries())
        .map(([color, data]) => {
          // Create a label from calendar names if available
          // const calendarNames = Array.from(data.calendarNames);
          // const label = calendarNames.length > 0
          //   ? calendarNames.join(', ')
          //   : undefined;
          const label = ''

          return {
            color,
            label,
            value: data.total
          };
        })
        .filter((colorDuration: IColorDuration) => colorDuration.value > 0),
      // Sort by value in descending order
      (colorDuration: IColorDuration) => -colorDuration.value
    );
  }, [calendarEvents, isLoading, error]);

  return { colorDurations, isLoading, error, timeRange };
};
