import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (term: string) => void;
}

export const SearchInput = ({ placeholder = "Search...", onSearch }: SearchInputProps) => {
  return (
    <form className="flex w-full md:ml-0" action="#" method="GET" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="search-field" className="sr-only">
        Search
      </label>
      <div className="relative w-full text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-300 max-w-md flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5" aria-hidden="true" />
        </div>
        <input
          id="search-field"
          className="block h-10 w-full rounded-full border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 bg-gray-100 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006970] dark:focus:ring-[#008990] sm:text-sm transition-all shadow-sm"
          placeholder={placeholder}
          type="search"
          name="search"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
    </form>
  );
};

export default SearchInput;
