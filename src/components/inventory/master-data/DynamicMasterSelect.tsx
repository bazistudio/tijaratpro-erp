'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check, X } from 'lucide-react';
import { useMasterData } from '@/features/inventory/hooks/useMasterData';

export interface MasterOption {
  id: string;
  name: string;
}

export interface DynamicMasterSelectProps {
  entity: 'category' | 'brand' | 'company' | 'color' | 'quality';
  value: string;
  onChange: (id: string) => void;
  hideAllOption?: boolean;
  showAddButton?: boolean;
}

export function DynamicMasterSelect({ entity, value, onChange, hideAllOption = false, showAddButton = false }: DynamicMasterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingMode, setIsCreatingMode] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { options, isLoading, createOption, isCreating, updateOption, isUpdating } = useMasterData(entity);

  useEffect(() => {
    if (isCreatingMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreatingMode]);

  useEffect(() => {
    if (editingOptionId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingOptionId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Optional: cancel inline editing if clicking outside
        // if (editingOptionId) { setEditingOptionId(null); setEditingName(''); }
      }
    };
    
    if (isOpen || editingOptionId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, editingOptionId]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  const openCreateMode = () => {
    setIsOpen(false);
    setNewEntityName('');
    setError('');
    setIsCreatingMode(true);
  };

  const handleCancel = () => {
    setIsCreatingMode(false);
    setNewEntityName('');
    setError('');
  };

  const handleCreate = async () => {
    if (!newEntityName.trim()) {
      setError('Name is required');
      return;
    }
    try {
      setError('');
      
      const name = newEntityName.trim();
      const code = name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 10) + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
      
      const payload: any = { name, status: 'active' };
      if (entity === 'brand') payload.brandCode = code;
      if (entity === 'company') payload.companyCode = code;
      if (entity === 'quality') payload.qualityCode = code;
      if (entity === 'color') payload.hexCode = '#000000';
      
      const result = await createOption(payload);
      if (result?.id) {
        onChange(result.id);
        setIsOpen(false);
      }
      setIsCreatingMode(false);
      setNewEntityName('');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create');
    }
  };

  const handleEditClick = (opt: MasterOption) => {
    setEditingOptionId(opt.id);
    setEditingName(opt.name);
  };

  const handleCancelEdit = () => {
    setEditingOptionId(null);
    setEditingName('');
  };

  const handleUpdate = async () => {
    if (!editingName.trim() || !editingOptionId) return;
    try {
      await updateOption({ id: editingOptionId, data: { name: editingName.trim() } });
      setEditingOptionId(null);
      setEditingName('');
    } catch (err) {
      console.error('Failed to update option', err);
    }
  };

  if (isCreatingMode) {
    return (
      <div ref={containerRef} className="flex items-center gap-1 w-full relative">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={newEntityName}
            onChange={(e) => {
              setNewEntityName(e.target.value);
              setError('');
            }}
            placeholder={`New ${entity} name...`}
            className={`block w-full px-3 py-1.5 border rounded shadow-sm focus:ring-[#006970] focus:border-[#006970] dark:bg-gray-800 dark:text-white sm:text-sm ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreate();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            disabled={isCreating}
          />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          disabled={isCreating}
          className="p-1.5 text-white bg-[#006970] hover:bg-[#005a60] border border-transparent rounded shadow-sm disabled:opacity-50 transition-colors flex-shrink-0"
          title="Save"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleCancel();
          }}
          disabled={isCreating}
          className="p-1.5 text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 transition-colors flex-shrink-0"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
        {error && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500">{error}</span>}
      </div>
    );
  }

  const mergedOptions = Array.isArray(options) ? options : [];

  const selectedOption = mergedOptions.find((opt: MasterOption) => opt.id === value);
  const defaultLabel = hideAllOption ? `Select ${entity}` : entity.charAt(0).toUpperCase() + entity.slice(1);
  const displayLabel = selectedOption ? selectedOption.name : defaultLabel;

  return (
    <div ref={containerRef} className="flex items-center gap-1 w-full">
      <div className="relative inline-block text-left flex-1">
        <button
          onClick={toggleDropdown}
          type="button"
          className="inline-flex justify-between items-center w-full min-w-[120px] px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className="w-4 h-4 ml-2 -mr-1" />
        </button>

        {isOpen && (
          <div className="absolute z-30 w-48 mt-1 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:divide-gray-700">

            <div className="py-1 max-h-48 overflow-y-auto">
              {/* "All" Option */}
              {!hideAllOption && (
                <button
                  onClick={() => handleSelect('')}
                  type="button"
                  className={`w-full text-left px-4 py-2 text-sm ${!value ? 'bg-gray-100 text-gray-900 font-semibold dark:bg-gray-700 dark:text-white' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  All {entity}s
                </button>
              )}

              {/* Dynamic Options */}
              {mergedOptions.map((opt: MasterOption) => (
                editingOptionId === opt.id ? (
                  <div key={opt.id} className="w-full flex items-center px-2 py-1 bg-gray-50 dark:bg-gray-700">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpdate();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCancelEdit();
                        }
                      }}
                      className="block w-full px-2 py-1 text-sm border rounded shadow-sm focus:ring-[#006970] focus:border-[#006970] dark:bg-gray-800 dark:text-white dark:border-gray-600 mr-1"
                      disabled={isUpdating}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUpdate();
                      }}
                      disabled={isUpdating}
                      className="p-1 text-white bg-[#006970] hover:bg-[#005a60] rounded shadow-sm disabled:opacity-50 flex-shrink-0"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    key={opt.id}
                    onClick={(e) => {
                      if (e.detail === 1) handleSelect(opt.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(opt);
                    }}
                    type="button"
                    className={`w-full text-left px-4 py-2 text-sm ${value === opt.id ? 'bg-gray-100 text-gray-900 font-semibold dark:bg-gray-700 dark:text-white' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    {opt.name}
                  </button>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {showAddButton && (
        <button
          onClick={openCreateMode}
          type="button"
          className="p-1.5 text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded shadow-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          title={`Add ${entity}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
