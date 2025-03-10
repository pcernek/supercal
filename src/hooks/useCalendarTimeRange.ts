import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSender } from '../messages/MessageSender';
import { ICalendarEvent, ICalendarList } from '../messages/handlers';
import { useCalendarList } from './useCalendarList';

/**
 * Custom hook to detect URL changes
 */
function useUrl() {
  const [url, setUrl] = useState(window.location.href);

  useEffect(() => {
    // Function to update the URL state
    const handleURLChange = () => {
      setUrl(window.location.href);
    };

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleURLChange);

    // Create a MutationObserver to detect changes to the URL via history.pushState
    const observer = new MutationObserver(() => {
      if (window.location.href !== url) {
        handleURLChange();
      }
    });

    // Observe the document title as a proxy for navigation changes
    const titleElement = document.querySelector('title');
    if (titleElement) {
      observer.observe(titleElement, {
        subtree: true,
        characterData: true,
        childList: true
      });
    } else {
      // If there's no title element, observe the document body instead
      observer.observe(document.body, {
        subtree: true,
        childList: true
      });
    }

    // Clean up
    return () => {
      window.removeEventListener('popstate', handleURLChange);
      observer.disconnect();
    };
  }, [url]);

  return url;
}

/**
 * Hook that queries the DOM for the first and last elements with data-eventid attribute
 * and fetches the corresponding events from Google Calendar API
 */
export function useCalendarTimeRange() {
  console.log('useCalendarTimeRange');
  // Get the list of calendars
  const { calendars, isLoading: isLoadingCalendars, error: calendarError } = useCalendarList();

  // Track URL changes
  const currentUrl = useUrl();

  // State to store the event IDs found in the DOM
  const [eventIds, setEventIds] = useState<{ firstEventId: string | null; lastEventId: string | null }>({
    firstEventId: null,
    lastEventId: null
  });

  // State to store the time range derived from the events
  const [timeRange, setTimeRange] = useState<{ timeMin: string | null; timeMax: string | null }>({
    timeMin: null,
    timeMax: null
  });

  // Function to find the first and last elements with data-eventid
  const findEventElements = () => {
    console.log('findEventElements');
    // Query all elements with data-eventid attribute
    const eventElements = document.querySelectorAll('div[data-eventid]');

    if (eventElements.length === 0) {
      console.log('no event elements found');
      return { firstEventId: null, lastEventId: null };
    }

    // Get the first and last elements
    const firstElement = eventElements[0];
    const lastElement = eventElements[eventElements.length - 1];

    // Extract the event IDs
    const firstEventId = firstElement.getAttribute('data-eventid');
    const lastEventId = lastElement.getAttribute('data-eventid');

    console.log('firstEventId', firstEventId);
    console.log('lastEventId', lastEventId);

    return { firstEventId, lastEventId };
  };

  // Effect to query the DOM for elements with data-eventid attribute when URL changes
  useEffect(() => {
    const { firstEventId, lastEventId } = findEventElements();

    // Only update state if the IDs have changed
    if (firstEventId !== eventIds.firstEventId || lastEventId !== eventIds.lastEventId) {
      console.log('update eventIds', firstEventId, lastEventId);
      setEventIds({ firstEventId, lastEventId });
    }
  }, [currentUrl]);

  // Query to fetch the events by ID
  const { data: events, isLoading: isLoadingEvents, error: eventsError } = useQuery({
    queryKey: ['calendarEventsByIds', eventIds.firstEventId, eventIds.lastEventId, calendars],
    queryFn: async () => {
      // Don't fetch if we don't have both event IDs or calendars
      if (!eventIds.firstEventId || !eventIds.lastEventId || !calendars || calendars.length === 0) {
        return [];
      }

      // Fetch the first event from all calendars in parallel
      const firstEvent = await fetchEventFromAllCalendars(eventIds.firstEventId, calendars);

      // Fetch the last event from all calendars in parallel
      const lastEvent = await fetchEventFromAllCalendars(eventIds.lastEventId, calendars);

      // If we have both events, determine the time range
      if (firstEvent && lastEvent) {
        // Get the start time of the first event and end time of the last event
        const timeMin = getEventStartTime(firstEvent);
        const timeMax = getEventEndTime(lastEvent);

        // Update the time range state
        if (timeMin && timeMax) {
          setTimeRange({ timeMin, timeMax });
        }

        return [firstEvent, lastEvent];
      }

      return [];
    },
    enabled: !!eventIds.firstEventId && !!eventIds.lastEventId && !!calendars && calendars.length > 0,
  });

  // Helper function to fetch an event from all calendars in parallel
  const fetchEventFromAllCalendars = async (eventId: string, calendarList: ICalendarList[]): Promise<ICalendarEvent | null> => {
    try {
      // Create an array of promises, one for each calendar
      const promises = calendarList.map(calendar =>
        MessageSender.getCalendarEventById(calendar.id, eventId)
          .then(response => {
            if (response.success) {
              // Add calendar information to the event
              return {
                ...response.data,
                calendarId: calendar.id,
                calendarSummary: calendar.summary
              };
            }
            return null;
          })
          .catch(error => {
            console.error(`Error fetching event from calendar ${calendar.summary}:`, error);
            return null;
          })
      );

      // Wait for all promises to resolve
      const results = await Promise.all(promises);

      // Find the first non-null result (the event was found in one of the calendars)
      return results.find(result => result !== null) || null;
    } catch (error) {
      console.error('Error fetching event from calendars:', error);
      return null;
    }
  };

  // Helper function to get the start time of an event
  const getEventStartTime = (event: ICalendarEvent): string | null => {
    return event.start.dateTime || event.start.date || null;
  };

  // Helper function to get the end time of an event
  const getEventEndTime = (event: ICalendarEvent): string | null => {
    return event.end.dateTime || event.end.date || null;
  };

  const isLoading = isLoadingCalendars || isLoadingEvents;
  const error = calendarError || eventsError;

  return {
    events,
    isLoading,
    error,
    timeRange,
    eventIds,
    currentUrl // Include the current URL in the return value for debugging
  };
}
