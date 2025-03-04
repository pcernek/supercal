import { useState, useEffect } from 'react';

interface IPosition {
  x: number;
  y: number;
}

export const useDraggable = (initialPosition: IPosition = { x: 100, y: 100 }) => {
  const [position, setPosition] = useState<IPosition>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<IPosition>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, dragHandleClass: string) => {
    if (e.target instanceof HTMLElement && e.target.closest(`.${dragHandleClass}`)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return {
    position,
    isDragging,
    handleMouseDown
  };
}; 