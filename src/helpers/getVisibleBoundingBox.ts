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
export const getVisibleBoundingBox = (
  element: HTMLElement,
  padding: number = 20
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