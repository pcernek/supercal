import { useState, useEffect } from 'react';
import { ICalendarEventParsed, useCalendarEvents2 } from './useCalendarEvents2';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '../helpers';

export function useCalendarEvents3(timeMin: Date, timeMax: Date) {
  const [events, setEvents] = useState<ICalendarEventParsed[]>([]);
  // Add a state to track DOM changes
  const [domChangeCounter, setDomChangeCounter] = useState(0);

  // Get access to the query client for cache invalidation
  const queryClient = useQueryClient();

  // Fetch calendar events for the time range
  const { events: loadedEvents, isLoading, error } =
    useCalendarEvents2(
      timeMin,
      timeMax
    );

  // Set up a MutationObserver to detect changes in the DOM within data-view-heading
  useEffect(() => {
    console.log('Setting up MutationObserver for data-view-heading');

    // Function to find the heading element
    const findHeadingElement = () => {
      return document.querySelector('div[data-view-heading]');
    };

    const headingElement = findHeadingElement();
    if (!headingElement) {
      console.log('No element with data-view-heading found');
      return;
    }

    // Create a MutationObserver to watch for changes
    const observer = new MutationObserver((mutations) => {
      console.log('MutationObserver detected changes in data-view-heading', mutations);

      // Invalidate the calendar events query to force a refetch
      queryClient.invalidateQueries({ queryKey: [QueryKeys.CalendarEvents] });
      console.log('Invalidated calendar events query cache');

      // Increment the counter to trigger a re-render
      setDomChangeCounter(prev => prev + 1);
    });

    // Start observing the heading element
    observer.observe(headingElement, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    // Clean up the observer when the component unmounts
    return () => {
      console.log('Disconnecting MutationObserver');
      observer.disconnect();
    };
  }, [queryClient]); // Add queryClient as a dependency

  // Clear events when loadedEvents changes to prevent double-counting
  useEffect(() => {
    setEvents([]);
  }, [loadedEvents]);

  // grab event IDs from DOM
  useEffect(() => {
    if (isLoading || error || !loadedEvents) {
      console.log('useCalendarEvents3: no calendar events', isLoading, error);
      return;
    }

    console.log('useCalendarEvents3: loadedEvents', loadedEvents);

    const eventMap = new Map<string, ICalendarEventParsed>(
      loadedEvents.map((event) => {
        // example: "https://www.google.com/calendar/event?eid=aDBpZ28wbGJlNXRncDdjcHQ0ZTB2am4wdm8ga2FpdC5zaGFubm9uQG0"
        // Not sure why this property shows up here but not in id field
        const id = event.htmlLink.split('?eid=')[1];
        return [id, event]
      })
    );

    const parsedEvents: ICalendarEventParsed[] = [];
    const eventElements = document.querySelectorAll('div[data-eventchip]');
    const processedIds = new Set<string>(); // Track processed IDs to prevent duplicates

    for (const element of eventElements) {
      const eventId = element.getAttribute('data-eventid');
      // these represent full-day events that are not relevant to us
      const isStacked = element.getAttribute('data-stacked-layout-chip-container') === 'true';

      if (isStacked) {
        console.log('useCalendarEvents3: stacked event, skipping', element);
        continue;
      }

      if (eventId && !processedIds.has(eventId)) {
        processedIds.add(eventId); // Mark this ID as processed
        const event = eventMap.get(eventId);
        if (event) {
          console.log('useCalendarEvents3: found event', event);
          parsedEvents.push(event);
        } else {
          console.log('useCalendarEvents3: no event found for event ID', eventId);
        }
      } else if (!eventId) {
        console.log('useCalendarEvents3: no event ID found for element', element);
      }
    }

    console.log('useCalendarEvents3: parsedEvents', parsedEvents);
    setEvents(parsedEvents);
  }, [isLoading, error, loadedEvents, domChangeCounter]); // Added domChangeCounter as a dependency

  return { events, isLoading, error };
}
