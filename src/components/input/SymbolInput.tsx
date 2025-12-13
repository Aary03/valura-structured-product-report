/**
 * Symbol Input Component with Autocomplete
 * Search and select stock symbols
 */

import { useState, useRef, useEffect } from 'react';
import { useSymbolSearch } from '../../hooks/useSymbolSearch';
import { Search, X } from 'lucide-react';

interface SymbolInputProps {
  value: string;
  nameValue?: string;
  onChange: (symbol: string, name?: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SymbolInput({
  value,
  nameValue,
  onChange,
  placeholder = 'Search symbol...',
  label,
  required = false,
  disabled = false,
}: SymbolInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { results, loading, search, clearResults } = useSymbolSearch();

  // Search when query changes (debounced)
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        search(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      clearResults();
    }
  }, [searchQuery, search, clearResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: { symbol: string; name: string }) => {
    onChange(result.symbol, result.name);
    setIsOpen(false);
    setSearchQuery('');
    clearResults();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
    setSearchQuery(newValue);
    if (newValue.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleFocus = () => {
    if (value.length >= 2) {
      setSearchQuery(value);
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="label">{label}</label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted" />
        </div>
        <input
          type="text"
          className="input-field pl-10 pr-10"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSearchQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-valura-ink"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && (loading || results.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-strong max-h-60 overflow-auto">
          {loading && (
            <div className="p-3 text-center text-muted text-sm">Searching...</div>
          )}
          {!loading && results.length === 0 && searchQuery.length >= 2 && (
            <div className="p-3 text-center text-muted text-sm">No results found</div>
          )}
          {!loading && results.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-valura-mint-100/30 transition-colors border-b border-border last:border-b-0"
            >
              <div className="font-semibold text-valura-ink">{result.symbol}</div>
              <div className="text-sm text-muted">{result.name}</div>
              {result.exchangeShortName && (
                <div className="text-xs text-muted mt-1">{result.exchangeShortName}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

