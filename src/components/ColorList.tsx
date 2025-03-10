import React from 'react';
import { formatDuration } from '../utils';

interface IColorListProps {
  sortedColors: [string, number][];
  colorMap: Map<string, { id: string }>;
  colorIdToRgb: Map<string, string>;
}

export const ColorList: React.FC<IColorListProps> = ({
  sortedColors,
  colorMap,
  colorIdToRgb,
}) => (
  <div
    className="card-body"
    style={{
      padding: '12px',
      userSelect: 'text',
    }}
  >
    {sortedColors.map(([colorKey, minutes]) => {
      const displayColor = colorIdToRgb?.get(colorKey) || 'rgb(3, 155, 229)';
      const colorName = colorMap?.get(colorKey)?.id || 'Unknown color';

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
              {formatDuration(minutes)}
            </div>
          </div>
        </div>
      );
    })}
  </div>
); 