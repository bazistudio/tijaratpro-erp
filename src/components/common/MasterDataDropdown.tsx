import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Search, Check, Loader2, Edit2, X, ChevronDown } from 'lucide-react';
import axiosInstance from '@/lib/api/axios';
import toast from 'react-hot-toast';

interface MasterDataRecord {
  _id: string;
  name: string;
  [key: string]: any;
}

interface MasterDataDropdownProps {
  endpoint: string;           // e.g. '/api/categories'
  label: string;              // e.g. 'Category'
  value: string;              // Selected ID
  onChange: (id: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export const MasterDataDropdown: React.FC<MasterDataDropdownProps> = ({
  endpoint,
  label,
  value,
  onChange,
  disabled = false,
  error,
  placeholder = 'Select...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<MasterDataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setIsEditing(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchItems = async (query = '') => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`${endpoint}/search`, { params: { keyword: query } });
      setItems(res.data.data || res.data);
    } catch (err: any) {
      console.error(`Error fetching ${label}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and fetch on search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, endpoint]); // Only re-run if search or endpoint changes

  const handleCreate = async () => {
    if (!inputValue.trim()) return;
    try {
      setIsLoading(true);
      const res = await axiosInstance.post(endpoint, { name: inputValue.trim() });
      const newItem = res.data.data || res.data;
      toast.success(`${label} created successfully`);
      setIsCreating(false);
      setInputValue('');
      setSearch('');
      await fetchItems();
      onChange(newItem._id || newItem.id);
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to create ${label}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!inputValue.trim()) return;
    try {
      setIsLoading(true);
      await axiosInstance.put(`${endpoint}/update/${id}`, { name: inputValue.trim() });
      toast.success(`${label} updated successfully`);
      setIsEditing(null);
      setInputValue('');
      await fetchItems(search);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to update ${label}`);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedItem = useMemo(() => items.find(i => i._id === value || i.id === value), [items, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isCreating) {
        handleCreate();
      } else if (isEditing) {
        handleEdit(isEditing);
      }
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setIsEditing(null);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      
      <div 
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled && !isCreating && !isEditing) setIsOpen(!isOpen);
          }
        }}
        className={`flex items-center justify-between w-full rounded-xl border ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 py-2.5 px-3 text-sm focus-within:border-[#006970] focus-within:ring-1 focus-within:ring-[#006970] dark:text-white transition-colors cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => { if (!disabled && !isCreating && !isEditing) setIsOpen(!isOpen); }}
      >
        <div className="flex-1 truncate text-left pr-2 text-gray-700 dark:text-gray-200">
          {selectedItem ? selectedItem.name : <span className="text-gray-400">{placeholder}</span>}
        </div>
        
        <div className="flex items-center gap-1 text-gray-400 shrink-0">
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) return;
              setIsCreating(true);
              setIsOpen(true);
              setInputValue('');
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            title={`Create new ${label}`}
          >
            <Plus className="w-4 h-4 text-[#006970] dark:text-[#00adb5]" />
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col">
          
          {/* Create / Edit Input */}
          {(isCreating || isEditing) ? (
            <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 sticky top-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isEditing ? "Rename..." : `New ${label} name...`}
                  className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#006970]"
                />
                <button
                  type="button"
                  onClick={() => isEditing ? handleEdit(isEditing) : handleCreate()}
                  disabled={isLoading || !inputValue.trim()}
                  className="p-1.5 bg-[#006970] text-white rounded-lg hover:bg-[#005a60] disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setIsEditing(null); }}
                  className="p-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-0 text-gray-900 dark:text-white"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* List Options */}
          {!isCreating && (
            <div className="py-1 flex-1 overflow-y-auto max-h-48">
              {isLoading && items.length === 0 ? (
                <div className="p-3 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div>
              ) : items.length === 0 ? (
                <div className="p-3 text-center text-sm text-gray-500">
                  No {label.toLowerCase()}s found.
                </div>
              ) : (
                items.map((item) => (
                  <div 
                    key={item._id || item.id}
                    onClick={() => {
                      onChange(item._id || item.id);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 group ${value === (item._id || item.id) ? 'bg-[#006970]/10 text-[#006970] dark:text-[#00adb5] font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    <div className="flex-1 truncate">{item.name}</div>
                    
                    <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(item._id || item.id);
                          setInputValue(item.name);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title="Edit name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
