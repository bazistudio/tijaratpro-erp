'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export interface InventoryChartProps {
  data?: Array<{ name: string; value: number; color?: string }>;
  height?: number;
}

const defaultData = [
  { name: 'Healthy Stock', value: 780, color: '#10B981' },
  { name: 'Low Stock Alert', value: 45, color: '#F59E0B' },
  { name: 'Out of Stock', value: 18, color: '#EF4444' },
];

export const InventoryChart: React.FC<InventoryChartProps> = ({ data = defaultData, height = 300 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => [`${value} items`, 'Count']}
            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InventoryChart;

