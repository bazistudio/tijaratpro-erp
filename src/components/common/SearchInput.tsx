import React, { useState, useRef, useEffect } from 'react';
import { Search, Package, Users, Truck, FileText, Loader2 } from 'lucide-react';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import Link from 'next/link';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (term: string) => void;
}

export const SearchInput = ({ placeholder = "Search products, customers, invoices...", onSearch }: SearchInputProps) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { results, isLoading, error, debouncedQuery } = useGlobalSearch(query, isFocused, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleLinkClick = () => {
    setIsFocused(false);
    setQuery('');
  };

  const getMatchBadge = (item: any, query: string, fields: { key: string; label: string }[]) => {
    if (!query) return null;
    const q = query.toLowerCase();
    
    let bestMatch: { label: string; priority: number } | null = null;
    
    for (const field of fields) {
      const val = item[field.key];
      if (!val) continue;
      
      const itemStr = String(val).toLowerCase();
      let priority = -1;
      
      if (itemStr === q) priority = 3; // exact
      else if (itemStr.startsWith(q)) priority = 2; // startsWith
      else if (itemStr.includes(q)) priority = 1; // includes
      
      if (priority > (bestMatch?.priority || 0)) {
        bestMatch = { label: field.label, priority };
      }
      
      // Early exit if exact match found
      if (priority === 3) break;
    }
    
    if (bestMatch) {
      return (
        <span className="ml-2 text-[10px] uppercase tracking-wider bg-[#006970]/10 text-[#006970] dark:bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-[#006970]/20 dark:border-emerald-500/20">
          Matched {bestMatch.label}
        </span>
      );
    }
    
    return null;
  };

  const hasResults =
    results.products.length > 0 ||
    results.customers.length > 0 ||
    results.suppliers.length > 0 ||
    results.invoices.length > 0;

  return (
    <div className="relative flex w-full md:ml-0 max-w-2xl" ref={dropdownRef}>
      <form className="w-full" action="#" method="GET" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="search-field" className="sr-only">
          Search
        </label>
        <div className="relative w-full text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-300 flex items-center">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#006970]" aria-hidden="true" />
            ) : (
              <Search className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <input
            id="search-field"
            className="block h-10 w-full rounded-full border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 bg-gray-100 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#006970] dark:focus:ring-[#008990] sm:text-sm transition-all shadow-sm"
            placeholder={placeholder}
            type="search"
            name="search"
            autoComplete="off"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
          />
        </div>
      </form>

      {/* Dropdown UI */}
      {isFocused && query.trim().length >= 2 && (
        <div className="absolute top-12 left-0 w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
          <div className="max-h-[70vh] overflow-y-auto p-2">
            
            {error && (
              <div className="p-4 text-sm text-red-500 text-center">{error}</div>
            )}

            {!isLoading && !hasResults && !error && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm mb-4">No results found for "{query}"</p>
                <div className="flex flex-col gap-2 text-xs">
                  <p className="text-gray-400">Suggestions:</p>
                  <p>• Try searching by SKU</p>
                  <p>• Try customer phone</p>
                  <p>• Try invoice number</p>
                </div>
              </div>
            )}

            {/* Products */}
            {results.products.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Package className="h-4 w-4" /> Products
                </div>
                <div className="space-y-1">
                  {results.products.map(product => (
                    <Link
                      key={product._id}
                      href={`/dashboard/shop-admin/products/${product._id}`}
                      onClick={handleLinkClick}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#006970] dark:group-hover:text-[#008990] flex items-center">
                          {product.name}
                          {getMatchBadge(product, query, [
                            { key: 'name', label: 'Name' },
                            { key: 'sku', label: 'SKU' },
                            { key: 'barcode', label: 'Barcode' }
                          ])}
                        </p>
                        <p className="text-xs text-gray-500">{product.sku || product.barcode}</p>
                      </div>
                      <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        Qty: {product.quantity}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Customers */}
            {results.customers.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4" /> Customers
                </div>
                <div className="space-y-1">
                  {results.customers.map(customer => (
                    <Link
                      key={customer._id}
                      href={`/dashboard/shop-admin/customers/${customer._id}`}
                      onClick={handleLinkClick}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#006970] dark:group-hover:text-[#008990] flex items-center">
                          {customer.name}
                          {getMatchBadge(customer, query, [
                            { key: 'name', label: 'Name' },
                            { key: 'phone', label: 'Phone' },
                            { key: 'email', label: 'Email' }
                          ])}
                        </p>
                        <p className="text-xs text-gray-500">{customer.phone}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Suppliers */}
            {results.suppliers.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Suppliers
                </div>
                <div className="space-y-1">
                  {results.suppliers.map(supplier => (
                    <Link
                      key={supplier._id}
                      href={`/dashboard/shop-admin/suppliers/${supplier._id}`}
                      onClick={handleLinkClick}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#006970] dark:group-hover:text-[#008990] flex items-center">
                          {supplier.name}
                          {getMatchBadge(supplier, query, [
                            { key: 'name', label: 'Name' },
                            { key: 'companyName', label: 'Company' },
                            { key: 'phone', label: 'Phone' },
                            { key: 'email', label: 'Email' }
                          ])}
                        </p>
                        <p className="text-xs text-gray-500">{supplier.companyName || supplier.phone}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Invoices */}
            {results.invoices.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Invoices
                </div>
                <div className="space-y-1">
                  {results.invoices.map(invoice => (
                    <Link
                      key={invoice._id}
                      href={`/dashboard/shop-admin/history?invoice=${invoice._id}`}
                      onClick={handleLinkClick}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#006970] dark:group-hover:text-[#008990] flex items-center">
                          Invoice #{invoice.invoiceNumber}
                          {getMatchBadge(invoice, query, [
                            { key: 'invoiceNumber', label: 'Invoice #' }
                          ])}
                        </p>
                        <p className="text-xs text-gray-500">
                          {typeof invoice.customerId === 'object' && invoice.customerId !== null ? invoice.customerId.name : 'Walk-in'}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        invoice.status === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {invoice.status}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
