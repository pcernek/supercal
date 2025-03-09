interface IPosition {
  x: number;
  y: number;
}

interface IBoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Adjusts a position to ensure it's within the specified bounding box
 * 
 * @param position The current position of the element
 * @param fence The bounding box constraints
 * @returns A new position that is guaranteed to be within the bounding box
 */
export const applyPositionFence = (
  position: IPosition,
  fence: IBoundingBox | null
): IPosition => {
  if (!fence) return position;

  const { minX, maxX, minY, maxY } = fence;

  const newX = Math.max(minX, Math.min(position.x, maxX));
  const newY = Math.max(minY, Math.min(position.y, maxY));

  // Only create a new object if the position actually changed
  if (newX !== position.x || newY !== position.y) {
    return { x: newX, y: newY };
  }

  // Return the original position if no change is needed
  return position;
};
