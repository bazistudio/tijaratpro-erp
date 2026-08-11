'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface RevenueChartProps {
  data?: Array<{ label: string; revenue: number; net?: number }>;
  height?: number;
}

const defaultData = [
  { label: 'Mon', revenue: 12000, net: 8500 },
  { label: 'Tue', revenue: 19000, net: 14000 },
  { label: 'Wed', revenue: 15000, net: 11000 },
  { label: 'Thu', revenue: 22000, net: 17000 },
  { label: 'Fri', revenue: 28000, net: 21000 },
  { label: 'Sat', revenue: 34000, net: 26000 },
  { label: 'Sun', revenue: 25000, net: 19000 },
];

export const RevenueChart: React.FC<RevenueChartProps> = ({ data = defaultData, height = 300 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="revChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#006970" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#006970" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
          <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={12} />
          <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(v) => `Rs.${v / 1000}k`} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
            formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#006970" fillOpacity={1} fill="url(#revChartGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;

