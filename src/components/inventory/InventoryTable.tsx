'use client';

import React from 'react';

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export interface InventoryTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export function InventoryTable<T extends { id?: string }>({ 
  columns, 
  data,
  onRowClick 
}: InventoryTableProps<T>) {
  
  return (
    <div className="w-full h-full overflow-auto bg-white dark:bg-gray-900">
      <table className="w-full border-collapse text-sm text-left whitespace-nowrap">
        
        <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 shadow-sm border-b border-gray-300 dark:border-gray-700">
          <tr>
            {columns.map((col, index) => (
              <th 
                key={col.key} 
                className={`px-3 py-1.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-700 last:border-r-0 ${index === 0 ? 'border-l-0' : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="px-3 py-8 text-center text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800"
              >
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={() => onRowClick?.(row)}
                className={`border-b border-gray-200 dark:border-gray-800 hover:bg-[#006970]/5 dark:hover:bg-[#00B4BB]/10 transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, colIndex) => (
                  <td 
                    key={`${row.id || rowIndex}-${col.key}`} 
                    className={`px-3 py-1 text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-800 last:border-r-0 ${colIndex === 0 ? 'border-l-0' : ''}`}
                  >
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        
      </table>
    </div>
  );
}
