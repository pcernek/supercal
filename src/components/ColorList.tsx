import React from 'react';
import { formatDuration } from '../utils';
import { IColorDuration } from '../hooks/useColorDurations';

interface IColorListProps {
  items: IColorDuration[];
}

export const ColorList: React.FC<IColorListProps> = ({
  items
}) => (
  <div
    className="card-body"
    style={{
      padding: '12px',
      userSelect: 'text',
    }}
  >
    {items.length === 0 ? (
      <div
        className="empty-state"
        style={{
          textAlign: 'center',
          padding: '16px',
          color: '#666',
          fontStyle: 'italic'
        }}
      >
        Failed to load events from calendar
      </div>
    ) : (
      items.map((item) => (
        <div
          key={item.color + (item.label || '')}
          className="color-category"
          style={{
            paddingBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            margin: '4px 0',
            position: 'relative',
          }}
          title={item.label}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                background: item.color,
                marginRight: '8px',
                borderRadius: '2px',
              }}
            />
            <div>{item.label || ''}</div>
          </div>
          <div style={{ fontWeight: 500 }}>
            {formatDuration(item.value)}
          </div>
        </div>
      ))
    )}
  </div>
); 