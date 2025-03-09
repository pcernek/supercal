import { useCallback, useEffect, useState, useRef } from 'react';
import { useVisibleArea as useVisibleArea } from './useVisibleArea';
import { applyPositionFence } from '../helpers/applyPositionFence';

interface IPosition {
  x: number;
  y: number;
}

interface IUseAlwaysVisibleOptions {
  initialPosition: IPosition;
  onPositionChange?: (position: IPosition) => void;
  padding?: number;
}

/**
 * Hook to ensure an element stays within the viewport.
 */
export const useAlwaysVisible = ({
  initialPosition,
  onPositionChange,
  padding = 20,
}: IUseAlwaysVisibleOptions) => {
  // Ref for the element to be made visible
  const ref = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<IPosition>(initialPosition);

  const visibleArea = useVisibleArea(ref, padding);
  const visiblePosition = applyPositionFence(position, visibleArea);

  // Update internal position and notify parent if needed
  const updateVisiblePosition = useCallback((newPosition: IPosition) => {
    const newVisiblePosition = applyPositionFence(newPosition, visibleArea);;
    setPosition(newVisiblePosition);
    if (onPositionChange) {
      onPositionChange(newVisiblePosition);
    }
  }, [onPositionChange]);

  // Update position when visible area changes
  useEffect(() => {
    if (visibleArea) {
      updateVisiblePosition(visiblePosition);
    }
  }, [visibleArea, visiblePosition, updateVisiblePosition]);

  return {
    ref,
    position: visiblePosition,
    setPosition: updateVisiblePosition,
  };
}; 