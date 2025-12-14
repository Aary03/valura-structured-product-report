/**
 * Symbol Input Component with Autocomplete
 * Search and select stock symbols
 */

import { useState, useRef, useEffect } from 'react';
import { useSymbolSearch } from '../../hooks/useSymbolSearch';
import { Search, X } from 'lucide-react';
import { getLogoWithFallback } from '../../utils/logo';

interface SymbolInputProps {
  value: string;
  onChange: (symbol: string, name?: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SymbolInput({
  value,
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
    <div className="relative mb-4" ref={wrapperRef}>
      {label && (
        <label className="label">{label}</label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted" />
        </div>
        <input
          type="text"
          className="input-field pl-10 pr-12 bg-white border-2 border-border rounded-xl shadow-soft focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/30"
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
        <div className="absolute z-50 w-full mt-2 bg-white border border-border rounded-xl shadow-strong max-h-64 overflow-auto">
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
              className="w-full text-left px-4 py-3 hover:bg-primary-blue-bg/60 transition-colors border-b border-border last:border-b-0 flex items-center space-x-3"
            >
              {(() => {
                const { logoUrl, fallback } = getLogoWithFallback(result.symbol, result.name);
                return (
                  <div className="relative w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={logoUrl}
                      alt={result.symbol}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallbackEl = target.parentElement?.querySelector('.logo-fallback') as HTMLElement | null;
                        if (fallbackEl) fallbackEl.style.display = 'flex';
                      }}
                    />
                    <span className="logo-fallback hidden absolute inset-0 items-center justify-center text-sm font-bold text-primary-blue">
                      {fallback}
                    </span>
                  </div>
                );
              })()}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text-primary">{result.symbol}</div>
                <div className="text-sm text-text-secondary truncate">{result.name}</div>
                {result.exchangeShortName && (
                  <div className="text-xs text-text-secondary mt-1">{result.exchangeShortName}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

