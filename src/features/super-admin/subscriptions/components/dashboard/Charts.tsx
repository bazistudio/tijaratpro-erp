import React from 'react';

// Using simple HTML/CSS bars to act as a placeholder for charts
// In a real application, you'd use recharts or chart.js

export const PackageDistributionChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return <div className="text-gray-500 text-sm">No data available</div>;
  
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Package Distribution</h3>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{item.package}</span>
              <span className="text-gray-500">{item.count}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.max(1, (item.count / max) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SubscriptionGrowthChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return <div className="text-gray-500 text-sm">No data available</div>;

  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Growth</h3>
      <div className="flex items-end space-x-2 h-48 border-b border-gray-200 pb-2 mb-2 pt-6">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end relative group">
            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded transition-opacity">
              {item.count}
            </div>
            <div 
              className="w-full bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-colors" 
              style={{ height: `${Math.max(5, (item.count / max) * 100)}%` }}
            ></div>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 text-center text-xs text-gray-500">
            {item.month}
          </div>
        ))}
      </div>
    </div>
  );
};
