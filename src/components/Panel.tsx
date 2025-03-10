import React, { useRef } from 'react';
import { LocalStorageKeys } from '../helpers/LocalStorageKeys';
import { useColorDurations } from '../hooks/useColorDurations';
import { useDraggable } from '../hooks/useDraggable';
import { useKeepInViewport } from '../hooks/useKeepInViewport';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ColorList } from './ColorList';
import { PanelHeader } from './PanelHeader';
import { useUrl } from '../hooks/useUrl';
import { isValidCalendarView } from '../helpers';

export interface IColorInfo {
  id: string;
  background: string;
  foreground: string;
}

export const Panel: React.FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>(LocalStorageKeys.Panel.Collapsed, false);
  const { colorDurations, isLoading, error } = useColorDurations();

  const url = useUrl();
  console.log('panel: url', url);

  const { position, setPosition } = useKeepInViewport({
    ref: panelRef,
    initialPosition: { x: 100, y: 100 },
    padding: 20,
    storageKey: LocalStorageKeys.Panel.Position,
  });

  // Use the draggable hook with our position handler
  const { handleMouseDown } = useDraggable(position, setPosition);

  if (!isValidCalendarView(url)) {
    return null;
  }

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
        width: '200px',
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
        <>
          {isLoading && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Loading calendar data...
            </div>
          )}
          {error && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
              Error loading calendar data: {error.message || 'Unknown error'}
            </div>
          )}
          {!isLoading && !error && (
            <ColorList items={colorDurations} />
          )}
        </>
      )}
    </div>
  );
}; 