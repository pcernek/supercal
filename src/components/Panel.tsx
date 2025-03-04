import React from 'react';
import { IPanelOptions } from '../types';
import { useDraggable } from '../hooks/useDraggable';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PanelHeader } from './PanelHeader';
import { ColorList } from './ColorList';

interface IPanelProps extends IPanelOptions {
}

export const Panel: React.FC<IPanelProps> = ({
  grandTotal,
  sortedColors,
  colorMap,
  colorIdToRgb,
}) => {
  const [position, setPosition] = useLocalStorage<{ x: number; y: number }>('supercal_panel_position', { x: 100, y: 100 });
  const { handleMouseDown } = useDraggable(position, setPosition);
  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>('supercal_panel_collapsed', false);

  return (
    <div
      className="panel"
      style={{
        position: 'fixed',
        background: 'white',
        color: '#333',
        padding: 0,
        borderRadius: '8px',
        zIndex: 9999,
        fontFamily: "'Google Sans',Roboto,Arial,sans-serif",
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        cursor: 'default',
        width: '250px',
        maxHeight: '80vh',
        overflowY: 'auto',
        left: position.x,
        top: position.y,
      }}
      onMouseDown={(e) => handleMouseDown(e, 'drag-handle')}
    >
      <PanelHeader
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      {!isCollapsed && (
        <ColorList
          sortedColors={sortedColors}
          colorMap={colorMap}
          colorIdToRgb={colorIdToRgb}
          grandTotal={grandTotal}
        />
      )}
    </div>
  );
}; 