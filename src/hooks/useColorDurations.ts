import { useMemo } from 'react';
import { sortBy } from 'lodash-es';
import { useCalendarEvents } from './useCalendarEvents';
import { useCalendarColors } from './useCalendarColors';

export interface IColorDuration {
  color: string;  // RGB color string
  label?: string;  // Display name for the color
  value: number;  // Minutes value
}

export const useColorDurations = () => {
  const calendarEvents = useCalendarEvents();
  const { colors: calendarColors, isLoading: isLoadingColors, error: colorsError } = useCalendarColors();

  const isLoading = isLoadingColors;
  const error = colorsError;

  const colorDurations = useMemo(() => {
    if (isLoading || error || !calendarEvents || !calendarColors) {
      return [];
    }

    // Create a map to track color mappings (RGB value -> color ID)
    const colorMappings: Map<string, string> = new Map();

    // Create a map to store color metadata (ID -> {label, displayColor})
    const colorMetadata: Map<string, { label: string | undefined, displayColor: string }> = new Map();

    // Process event colors
    if (calendarColors.event) {
      Object.entries(calendarColors.event).forEach(([id, colorInfo]) => {
        const colorId = `event-${id}`;
        // Map both foreground and background colors to the same color ID
        colorMappings.set(colorInfo.background.toLowerCase(), colorId);
        colorMappings.set(colorInfo.foreground.toLowerCase(), colorId);
        // Store metadata using the background color as the display color
        colorMetadata.set(colorId, {
          label: `Event ${id}`,
          displayColor: colorInfo.background
        });
      });
    }

    // Process calendar colors
    if (calendarColors.calendar) {
      Object.entries(calendarColors.calendar).forEach(([id, colorInfo]) => {
        const colorId = `calendar-${id}`;
        // Map both foreground and background colors to the same color ID
        colorMappings.set(colorInfo.background.toLowerCase(), colorId);
        colorMappings.set(colorInfo.foreground.toLowerCase(), colorId);
        // Store metadata using the background color as the display color
        colorMetadata.set(colorId, {
          label: `Calendar ${id}`,
          displayColor: colorInfo.background
        });
      });
    }

    // Create a map to aggregate durations by color ID
    const durationsByColorId: Map<string, number> = new Map();

    // Process all calendar events
    calendarEvents.forEach(event => {
      const { color, durationMinutes } = event;

      // Try to find a color ID for this RGB value
      const colorId = colorMappings.get(color.toLowerCase());

      if (colorId) {
        // Add duration to existing color ID or create new entry
        const currentDuration = durationsByColorId.get(colorId) || 0;
        durationsByColorId.set(colorId, currentDuration + durationMinutes);
      } else {
        // If no mapping found, use the original color as the ID
        const currentDuration = durationsByColorId.get(color) || 0;
        durationsByColorId.set(color, currentDuration + durationMinutes);

        // Also add metadata for unmapped colors
        if (!colorMetadata.has(color)) {
          colorMetadata.set(color, {
            label: undefined,
            displayColor: color
          });
        }
      }
    });

    // Convert map to array of IColorDuration objects
    return sortBy(
      Array.from(durationsByColorId.entries())
        .map(([colorId, totalMinutes]) => {
          const metadata = colorMetadata.get(colorId);

          return {
            color: metadata ? metadata.displayColor : colorId,
            label: metadata ? metadata.label : undefined,
            value: totalMinutes
          };
        })
        .filter((colorDuration: IColorDuration) => colorDuration.value > 0),
      // Sort by value in descending order
      (colorDuration: IColorDuration) => -colorDuration.value
    );
  }, [calendarEvents, calendarColors, isLoading, error]);

  return { colorDurations, isLoading, error };
};
