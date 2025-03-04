import React from 'react';
import { IPanelOptions } from '../types';
import { formatDuration } from '../utils';
import { useDraggable } from '../hooks/useDraggable';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface IPanelProps extends IPanelOptions {
  onRefresh: () => void;
  onToggleCollapse: () => void;
}

export const Panel: React.FC<IPanelProps> = ({
  isCollapsed,
  grandTotal,
  sortedColors,
  colorMap,
  colorIdToRgb,
  onRefresh,
  onToggleCollapse,
}) => {
  const [position, setPosition] = useLocalStorage<{ x: number; y: number }>('supercal_panel_position', { x: 100, y: 100 });
  const { handleMouseDown } = useDraggable(position, setPosition);

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
        minWidth: '200px',
        width: 'max-content',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflowY: 'auto',
        left: position.x,
        top: position.y,
      }}
      onMouseDown={(e) => handleMouseDown(e, 'drag-handle')}
    >
      <div className="drag-handle" style={{
        padding: '8px 12px',
        background: '#f1f3f4',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        cursor: 'grab',
        borderBottom: '1px solid #dadce0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        userSelect: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={chrome.runtime.getURL('icon48.png')}
            width={16}
            height={16}
            style={{ marginRight: '8px' }}
            alt="Supercal logo"
          />
          <div style={{ fontWeight: 'bold' }}>Supercal (hello!)</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#1a73e8', marginRight: '8px' }}>API Data</span>
          <div
            className="refresh-button"
            onClick={onRefresh}
            style={{
              cursor: 'pointer',
              padding: '4px',
              marginRight: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
            }}
            title="Refresh data"
          >
            ↻
          </div>
          <div
            className="collapse-toggle"
            onClick={onToggleCollapse}
            style={{
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isCollapsed ? '▼' : '▲'}
          </div>
        </div>
      </div>
      <div
        className="card-body"
        style={{
          padding: '12px',
          display: isCollapsed ? 'none' : 'block',
          userSelect: 'text',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontWeight: 500, marginRight: '8px' }}>Total foo:</div>
          <div style={{ fontWeight: 'bold' }}>{formatDuration(grandTotal)}</div>
        </div>
        {sortedColors.map(([colorKey, minutes]) => {
          const displayColor = colorIdToRgb?.get(colorKey) || 'rgb(3, 155, 229)';
          const colorName = colorMap?.get(colorKey)?.id || 'Unknown color';
          const percentage = Math.round((minutes / grandTotal) * 100);

          return (
            <div
              key={colorKey}
              className="color-category"
              style={{
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: '1px solid #f1f3f4',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '4px 0',
                  position: 'relative',
                  justifyContent: 'space-between',
                }}
                title={colorName}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      background: displayColor,
                      marginRight: '8px',
                      borderRadius: '2px',
                    }}
                  />
                  <div>{colorName}</div>
                </div>
                <div style={{ fontWeight: 500 }}>
                  {formatDuration(minutes)} ({percentage}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 