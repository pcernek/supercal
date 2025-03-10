import { RefObject, useCallback, useEffect } from 'react';
import { useVisibleArea } from './useVisibleArea';
import { applyPositionFence } from '../helpers/applyPositionFence';
import { useLocalStorage } from './useLocalStorage';

interface IPosition {
  x: number;
  y: number;
}

interface IUseAlwaysVisibleOptions {
  /**
   * The ref of the element to be made visible
   */
  ref: RefObject<HTMLElement>;
  /**
   * The initial position of the element
   */
  initialPosition?: IPosition;
  /**
   * The padding to apply from the edges of the viewport
   */
  padding?: number;
  /**
   * The key to store the position in local storage
   */
  storageKey: string;
}

/**
 * Hook to ensure an element stays within the viewport.
 */
export const useKeepInViewport = ({
  ref,
  initialPosition = { x: 0, y: 0 },
  padding = 0,
  storageKey,
}: IUseAlwaysVisibleOptions) => {
  const [position, setPosition] = useLocalStorage<IPosition>(storageKey, initialPosition);

  const visibleArea = useVisibleArea(ref, padding);

  const setVisiblePosition = useCallback((newPosition: IPosition) => {
    const newVisiblePosition = applyPositionFence(newPosition, visibleArea);
    setPosition(newVisiblePosition);
  }, [setPosition, visibleArea]);

  // Ensure position is visible on first mount and when visible area changes
  useEffect(() => {
    setVisiblePosition(position);
  }, [setVisiblePosition]);

  return {
    ref,
    position,
    setPosition: setVisiblePosition,
  };
};
