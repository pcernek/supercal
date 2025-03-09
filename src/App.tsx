import React from 'react';
import { Panel } from './components/Panel';
import { IColorInfo } from './types';

export const App: React.FC = () => {
  // Dummy data for demonstration
  const dummyColors = [
    ['1', 120], // 2 hours
    ['2', 90],  // 1.5 hours
    ['3', 60],  // 1 hour
    ['4', 30],  // 30 minutes
  ] as [string, number][];

  const dummyColorMap = new Map<string, IColorInfo>([
    ['1', { id: 'Work Meetings', background: 'rgb(66, 133, 244)', foreground: '#ffffff' }],
    ['2', { id: 'Personal Time', background: 'rgb(52, 168, 83)', foreground: '#ffffff' }],
    ['3', { id: 'Project Planning', background: 'rgb(251, 188, 5)', foreground: '#000000' }],
    ['4', { id: 'Quick Syncs', background: 'rgb(234, 67, 53)', foreground: '#ffffff' }],
  ]);

  const dummyColorIdToRgb = new Map([
    ['1', 'rgb(66, 133, 244)'],  // Blue
    ['2', 'rgb(52, 168, 83)'],   // Green
    ['3', 'rgb(251, 188, 5)'],   // Yellow
    ['4', 'rgb(234, 67, 53)'],   // Red
  ]);

  const dummyGrandTotal = dummyColors.reduce((sum, [_, minutes]) => sum + minutes, 0);

  return (
    <Panel
      isCollapsed={false}
      grandTotal={dummyGrandTotal}
      sortedColors={dummyColors}
      colorMap={dummyColorMap}
      colorIdToRgb={dummyColorIdToRgb}
    />
  );
}
