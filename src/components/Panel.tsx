import React, { useRef } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useKeepInViewport } from '../hooks/useKeepInViewport';
import { PanelHeader } from './PanelHeader';
import { ColorList } from './ColorList';
import { LocalStorageKeys } from '../helpers/LocalStorageKeys';

export interface IColorInfo {
  id: string;
  background: string;
  foreground: string;
}

interface IPanelProps {
  sortedColors: [string, number][];
  colorMap: Map<string, IColorInfo>;
  colorIdToRgb: Map<string, string>;
}

export const Panel: React.FC<IPanelProps> = ({
  sortedColors,
  colorMap,
  colorIdToRgb,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>(LocalStorageKeys.Panel.Collapsed, false);

  const { position, setPosition } = useKeepInViewport({
    ref: panelRef,
    initialPosition: { x: 100, y: 100 },
    padding: 20,
    storageKey: LocalStorageKeys.Panel.Position,
  });

  // Use the draggable hook with our position handler
  const { handleMouseDown } = useDraggable(position, setPosition);

  return (
    <div
      ref={panelRef}
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
        />
      )}
    </div>
  );
}; 