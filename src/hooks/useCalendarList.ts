import { useQuery } from '@tanstack/react-query';
import { ICalendarList } from '../messages/handlers';
import { MessageSender } from '../messages/MessageSender';

export function useCalendarList() {
  const { data: calendars, isLoading, error } = useQuery<ICalendarList[]>({
    queryKey: ['calendarList'],
    queryFn: async () => {
      const response = await MessageSender.fetchCalendarList();
      if (!response.success) {
        throw new Error('Failed to fetch calendar list');
      }
      return response.data.items;
    }
  });

  return { calendars, isLoading, error };
}
