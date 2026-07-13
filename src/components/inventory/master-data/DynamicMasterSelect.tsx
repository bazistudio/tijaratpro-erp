'use client';

import React, { useState } from 'react';
import { ChevronDown, Plus, Settings2 } from 'lucide-react';
import { MasterDataDrawer } from './MasterDataDrawer';

export interface MasterOption {
  id: string;
  name: string;
}

import { useMasterData } from '@/features/inventory/hooks/useMasterData';

export interface DynamicMasterSelectProps {
  entity: 'category' | 'brand' | 'company' | 'color' | 'quality';
  value: string;
  onChange: (id: string) => void;
}

export function DynamicMasterSelect({ entity, value, onChange }: DynamicMasterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { options, isLoading } = useMasterData(entity);


  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  const handleOpenDrawer = () => {
    setIsOpen(false);
    setDrawerOpen(true);
  };

  const selectedOption = options.find((opt: MasterOption) => opt.id === value);
  const displayLabel = selectedOption ? selectedOption.name : entity.charAt(0).toUpperCase() + entity.slice(1);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="inline-flex justify-between items-center w-full min-w-[120px] px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className="w-4 h-4 ml-2 -mr-1" />
      </button>

      {isOpen && (
        <div className="absolute z-30 w-48 mt-1 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:divide-gray-700">
          
          <div className="py-1 max-h-48 overflow-y-auto">
            {/* "All" Option */}
            <button
              onClick={() => handleSelect('')}
              className={`w-full text-left px-4 py-2 text-sm ${
                !value ? 'bg-gray-100 text-gray-900 font-semibold dark:bg-gray-700 dark:text-white' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All {entity}s
            </button>
            
            {/* Dynamic Options */}
            {options.map((opt: MasterOption) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left px-4 py-2 text-sm ${
                  value === opt.id ? 'bg-gray-100 text-gray-900 font-semibold dark:bg-gray-700 dark:text-white' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
          
          <div className="py-1">
            <button
              onClick={handleOpenDrawer}
              className="group flex items-center w-full px-4 py-2 text-sm text-[#006970] hover:bg-gray-50 dark:text-[#00B4BB] dark:hover:bg-gray-700/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {entity}
            </button>
            <button
              onClick={handleOpenDrawer}
              className="group flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Manage {entity}s
            </button>
          </div>
        </div>
      )}

      <MasterDataDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        entity={entity}
      />
    </div>
  );
}
