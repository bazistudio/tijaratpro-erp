import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { KPIData } from '../../types/dashboard/kpi.types';

interface KPICardProps {
  data: KPIData;
  isLoading?: boolean;
}

export const KPICard = ({ data, isLoading = false }: KPICardProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
      </div>
    );
  }

  const { title, value, trend, icon, timeframe = 'vs last month' } = data;
  
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const isNeutral = trend === 0;

  return (
    <div className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-800">
      <div className="flex items-start justify-between mb-4 gap-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </h3>
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#006970]/10 text-[#006970] dark:bg-[#00B4BB]/10 dark:text-[#00B4BB] flex-shrink-0">
          {icon}
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
          {value}
        </div>
        
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                : isNegative
                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : isNegative ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timeframe}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
