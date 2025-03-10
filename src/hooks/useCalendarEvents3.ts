import { useState, useEffect } from 'react';
import { ICalendarEventParsed, useCalendarEvents2 } from './useCalendarEvents2';

export function useCalendarEvents3(timeMin: Date, timeMax: Date) {
  const [events, setEvents] = useState<ICalendarEventParsed[]>([]);

  // Fetch calendar events for the time range
  const { events: loadedEvents, isLoading, error } =
    useCalendarEvents2(
      timeMin,
      timeMax
    );

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
  }, [isLoading, error, loadedEvents]);

  return { events, isLoading, error };
}
