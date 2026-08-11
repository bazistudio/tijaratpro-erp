'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface SalesTrendChartProps {
  data?: Array<{ label: string; sales: number }>;
  height?: number;
}

const defaultData = [
  { label: 'Week 1', sales: 45000 },
  { label: 'Week 2', sales: 62000 },
  { label: 'Week 3', sales: 58000 },
  { label: 'Week 4', sales: 81000 },
];

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data = defaultData, height = 300 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
          <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={12} />
          <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(v) => `Rs.${v / 1000}k`} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
            formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Sales']}
          />
          <Bar dataKey="sales" fill="#006970" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesTrendChart;

