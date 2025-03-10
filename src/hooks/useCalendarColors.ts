import { useQuery } from '@tanstack/react-query';
import { ICalendarColors } from '../messages/handlers';
import { MessageSender } from '../messages/MessageSender';

export function useCalendarColors() {
  const { data: colors, isLoading, error } = useQuery<ICalendarColors>({
    queryKey: ['calendarColors'],
    queryFn: async () => {
      const response = await MessageSender.fetchCalendarColors();
      if (!response.success) {
        throw new Error('Failed to fetch calendar colors');
      }
      return response.data.colors;
    }
  });

  return { colors, isLoading, error };
}
