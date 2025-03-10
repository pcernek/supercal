import { useQuery } from '@tanstack/react-query';
import { ICalendarEvent, IFetchCalendarEventsPayload } from '../messages/handlers';
import { MessageSender } from '../messages/MessageSender';
import { useCalendarList } from './useCalendarList';
import { useCalendarColors } from './useCalendarColors';
import { QueryKeys } from '../helpers';

export interface ICalendarEventParsed extends ICalendarEvent {
  hexColor: string;
  durationMinutes: number;
  calendarId: string;
  calendarSummary: string;
}

export function useCalendarEvents2(timeMin: Date, timeMax: Date) {
  console.log('useCalendarEvents2: timeMin, timeMax', timeMin, timeMax);

  // First, get the list of calendars
  const { calendars, isLoading: isLoadingCalendars, error: calendarError } = useCalendarList();

  // Get calendar colors
  const { colors, isLoading: isLoadingColors, error: colorsError } = useCalendarColors();

  console.log('useCalendarEvents2: calendars, colors', calendars, colors);

  // Then fetch events from all calendars
  const { data: events, isLoading: isLoadingEvents, error: eventsError } = useQuery<ICalendarEventParsed[]>({
    queryKey: [QueryKeys.CalendarEvents, timeMin, timeMax, calendars],
    queryFn: async () => {
      // Don't fetch if we don't have calendars yet
      if (!calendars || calendars.length === 0) {
        console.log('useCalendarEvents2: calendars have not yet loaded', calendars);
        return [];
      }

      console.log('useCalendarEvents2: calendars have loaded', calendars);

      // Fetch events from each calendar concurrently
      const eventPromises = calendars.map(async (calendar) => {
        try {
          const payload: IFetchCalendarEventsPayload = {
            timeMin: new Date(timeMin),
            timeMax: new Date(timeMax),
            calendarId: calendar.id
          };

          const response = await MessageSender.getCalendarEvents(payload);
          if (!response.success) {
            console.error(`Failed to fetch events for calendar ${calendar.summary}`);
            return [];
          }

          // Process each event to add calendar information, color, and duration
          return response.data.events.map(event => {
            // Calculate duration in minutes
            let durationMinutes = 0;
            if (event.start.dateTime && event.end.dateTime) {
              const startTime = new Date(event.start.dateTime);
              const endTime = new Date(event.end.dateTime);
              durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
            } else if (event.start.date && event.end.date) {
              // For all-day events, calculate days and convert to minutes
              const startDate = new Date(event.start.date);
              const endDate = new Date(event.end.date);
              // End date is exclusive in Google Calendar API, so subtract one day
              const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              durationMinutes = daysDiff * 24 * 60;
            }

            // Get the calendar's background color
            let hexColor = calendar.backgroundColor || '#4285F4'; // Default Google blue

            // If colors are available and the calendar has a colorId, use that color
            if (colors && calendar.colorId && colors.calendar && colors.calendar[calendar.colorId]) {
              hexColor = colors.calendar[calendar.colorId].background;
            }

            // If the event has its own colorId, use the event color instead
            if (colors && event.colorId && colors.event && colors.event[event.colorId]) {
              hexColor = colors.event[event.colorId].background;
            }

            return {
              ...event,
              calendarId: calendar.id,
              calendarSummary: calendar.summary,
              hexColor,
              durationMinutes
            };
          });
        } catch (error) {
          console.error(`Error fetching events for calendar ${calendar.summary}:`, error);
          return [];
        }
      });

      // Wait for all promises to resolve
      const eventsArrays = await Promise.all(eventPromises);

      // Flatten the array of arrays into a single array of events
      return eventsArrays.flat();
    },
    // Only run this query when we have the calendars and colors
    enabled: !!calendars && !!colors && timeMin instanceof Date && timeMax instanceof Date,
  });

  const isLoading = isLoadingCalendars || isLoadingColors || isLoadingEvents;
  const error = calendarError || colorsError || eventsError;

  // Add debug logging for the enabled condition
  console.log('useCalendarEvents2: query enabled condition:',
    !!calendars && !!colors && timeMin instanceof Date && timeMax instanceof Date,
    'calendars:', !!calendars, calendars?.length,
    'colors:', !!colors,
    'timeMin valid:', timeMin instanceof Date,
    'timeMax valid:', timeMax instanceof Date);
  console.log('useCalendarEvents2: isLoadingCalendars, isLoadingColors, isLoadingEvents', isLoadingCalendars, isLoadingColors, isLoadingEvents);
  console.log('useCalendarEvents2: calendarError, colorsError, eventsError', calendarError, colorsError, eventsError);

  return { events, isLoading, error };
}
