/**
 * Initial Price Selector Component
 * Allows user to choose reference price from historical data
 * Instead of hardcoding $100, use actual trade date prices
 */

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { fmpClient } from '../../services/api/financialModelingPrep';

interface InitialPriceSelectorProps {
  symbol: string;
  onPriceSelected: (price: number, date: string) => void;
  defaultPrice?: number;
}

interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function InitialPriceSelector({ 
  symbol, 
  onPriceSelected,
  defaultPrice = 100 
}: InitialPriceSelectorProps) {
  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPrice[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<number>(defaultPrice);
  const [loading, setLoading] = useState(false);
  const [useCustom, setUseCustom] = useState(false);

  // Load last 90 days of historical prices
  useEffect(() => {
    loadHistoricalPrices();
  }, [symbol]);

  const loadHistoricalPrices = async () => {
    setLoading(true);
    try {
      // Get 3 months of daily prices using FMP API
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);

      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];

      // Use FMP historical price endpoint
      const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${from}&to=${to}`;
      const data = await fmpClient.get<{ historical: HistoricalPrice[] }>(url);

      console.log('Historical data loaded for', symbol, data);

      if (data.historical && data.historical.length > 0) {
        // Sort by date (most recent first)
        const sorted = data.historical.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setHistoricalPrices(sorted);

        // Default to most recent price
        const recent = sorted[0];
        setSelectedDate(recent.date);
        setSelectedPrice(recent.close);
        onPriceSelected(recent.close, recent.date);
      } else {
        // Fallback: use current report data as reference
        console.warn('No historical data, using default');
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        onPriceSelected(defaultPrice, today);
      }
    } catch (error) {
      console.error('Failed to load historical prices:', error);
      // Fallback to default
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      setSelectedPrice(defaultPrice);
      onPriceSelected(defaultPrice, today);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const priceData = historicalPrices.find(p => p.date === date);
    if (priceData) {
      setSelectedPrice(priceData.close);
      onPriceSelected(priceData.close, date);
    }
  };

  const handleCustomPriceChange = (price: number) => {
    setSelectedPrice(price);
    onPriceSelected(price, selectedDate || new Date().toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-600">Loading historical prices for {symbol}...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500 rounded-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-valura-ink">{symbol} Reference Price</h4>
          <p className="text-xs text-muted">Choose your initial/trade date price</p>
        </div>
      </div>

      {/* Toggle between historical and custom */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setUseCustom(false)}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
            !useCustom 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-white text-valura-ink border border-border'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Historical Price
        </button>
        <button
          onClick={() => setUseCustom(true)}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
            useCustom 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-white text-valura-ink border border-border'
          }`}
        >
          Manual Entry
        </button>
      </div>

      {!useCustom ? (
        <div className="space-y-3">
          {/* Date Selector */}
          <div>
            <label className="text-sm font-semibold text-valura-ink mb-2 block">
              Select Trade Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 bg-white font-medium text-valura-ink"
            >
              {historicalPrices.slice(0, 90).map((price) => (
                <option key={price.date} value={price.date}>
                  {new Date(price.date).toLocaleDateString()} - ${price.close.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Price Display */}
          {selectedDate && (
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-xs text-muted">Open</div>
                  <div className="text-sm font-bold text-valura-ink">
                    ${historicalPrices.find(p => p.date === selectedDate)?.open.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted">High</div>
                  <div className="text-sm font-bold text-green-600">
                    ${historicalPrices.find(p => p.date === selectedDate)?.high.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted">Low</div>
                  <div className="text-sm font-bold text-red-600">
                    ${historicalPrices.find(p => p.date === selectedDate)?.low.toFixed(2)}
                  </div>
                </div>
                <div className="bg-blue-100 rounded-lg">
                  <div className="text-xs text-muted">Close (Used)</div>
                  <div className="text-lg font-black text-blue-600">
                    ${selectedPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="text-sm font-semibold text-valura-ink mb-2 block">
            Enter Custom Price
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={selectedPrice}
            onChange={(e) => handleCustomPriceChange(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 bg-white font-bold text-2xl text-valura-ink"
            placeholder="100.00"
          />
          <p className="text-xs text-muted mt-2">
            Enter the price at which you acquired or want to reference this position
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
        <div className="text-xs text-blue-700 font-semibold mb-1">
          Selected Reference Price:
        </div>
        <div className="text-2xl font-black text-blue-600">
          ${selectedPrice.toFixed(2)}
        </div>
        {selectedDate && !useCustom && (
          <div className="text-xs text-muted mt-1">
            As of {new Date(selectedDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
