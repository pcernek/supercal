import React from 'react';

interface IPanelHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const PanelHeader: React.FC<IPanelHeaderProps> = ({
  onToggleCollapse,
  isCollapsed,
}) => (
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
      <div style={{ fontWeight: 'bold' }}>Supercal</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
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
); 