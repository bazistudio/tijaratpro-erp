import React from 'react';
import { Search, Calendar, Filter, Download } from 'lucide-react';

interface Props {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const LedgerFilters: React.FC<Props> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="flex-1 w-full max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search Ref#, Party Name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#006970] focus:border-[#006970] sm:text-sm text-gray-900 dark:text-gray-100 transition-colors"
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap transition-colors">
          <Calendar className="h-4 w-4 text-gray-500" />
          Date Range
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap transition-colors">
          <Filter className="h-4 w-4 text-gray-500" />
          Type
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap transition-colors">
          <Filter className="h-4 w-4 text-gray-500" />
          Status
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 self-center mx-1"></div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#006970] border border-transparent rounded-md hover:bg-[#005a60] whitespace-nowrap transition-colors">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>
  );
};
