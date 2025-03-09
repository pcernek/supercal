import { useState, useEffect, useCallback, RefObject } from 'react';

/**
 * Interface representing the boundaries within which an element should stay
 */
export interface IBoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Calculates the boundaries required to keep an element wholly within the viewport
 *
 * @param element the HTML element for which to get the bounding box
 * @param padding Minimum distance from viewport edges
 * 
 * @returns Bounding box with constraints
 */
const calculateBoundingBox = (
  element: HTMLElement,
  padding: number
): IBoundingBox => {
  const rect = element.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  const maxX = window.innerWidth - width - padding;
  const maxY = window.innerHeight - height - padding;

  return {
    minX: padding,
    maxX,
    minY: padding,
    maxY,
  };
};

/**
 * Hook that provides and updates the visible bounding box for an element
 * Automatically recalculates on resizing of window or element
 * 
 * @param ref Reference to the HTML element
 * @param padding Minimum distance from viewport edges
 * @param dependencies Additional dependencies that should trigger recalculation
 * 
 * @returns The current bounding box or null if element is not available
 */
export const useVisibleArea = (
  ref: RefObject<HTMLElement>,
  padding: number = 20,
): IBoundingBox | null => {
  const [boundingBox, setBoundingBox] = useState<IBoundingBox | null>(null);

  const updateBoundingBox = useCallback(() => {
    if (!ref.current) {
      setBoundingBox(null);
      return;
    }

    const newBoundingBox = calculateBoundingBox(ref.current, padding);
    setBoundingBox(newBoundingBox);
  }, [ref, padding]);

  // Update on window resize
  useEffect(() => {
    window.addEventListener('resize', updateBoundingBox);
    return () => window.removeEventListener('resize', updateBoundingBox);
  }, [updateBoundingBox]);

  // Update on element resize
  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateBoundingBox();
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateBoundingBox]);

  return boundingBox;
};
