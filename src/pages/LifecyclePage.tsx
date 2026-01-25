/**
 * Unified Product Lifecycle Page
 * Works for: Regular Income, Capital Protection, Boosted Growth
 */

import { useState, useEffect } from 'react';
import type { ProductLifecycleData, CouponSchedule } from '../types/lifecycle';
import { LifecycleHero } from '../components/lifecycle/LifecycleHero';
import { KPIGrid } from '../components/lifecycle/KPIGrid';
import { TimelineBar } from '../components/lifecycle/TimelineBar';
import { UnderlyingsTable } from '../components/lifecycle/UnderlyingsTable';
import { TriggerChart } from '../components/lifecycle/TriggerChart';
import { CashflowsTable } from '../components/lifecycle/CashflowsTable';
import { OutcomeCards } from '../components/lifecycle/OutcomeCards';
import { AIInsightsCard } from '../components/lifecycle/AIInsightsCard';
import { CalculationsCard } from '../components/lifecycle/CalculationsCard';
import { ArrowLeft, Download, Share2, RefreshCw } from 'lucide-react';
import { getSampleData, type SampleType } from '../data/lifecycleSamples';
import { fetchHistoricalPrices, fetchCurrentQuotes } from '../services/lifecycleData';

interface LifecyclePageProps {
  data?: ProductLifecycleData;
  couponSchedule?: CouponSchedule[];
  notional?: number;
  historicalData?: Array<{
    date: string;
    [symbol: string]: number | string;
  }>;
}

export function LifecyclePage({ 
  data: providedData, 
  couponSchedule: providedCouponSchedule, 
  notional = 100000,
  historicalData: providedHistoricalData,
}: LifecyclePageProps) {
  // Sample selector for testing
  const [sampleType, setSampleType] = useState<SampleType>('regular_income');
  const [data, setData] = useState<ProductLifecycleData | null>(providedData || null);
  const [couponSchedule, setCouponSchedule] = useState<CouponSchedule[]>(providedCouponSchedule || []);
  const [historicalData, setHistoricalData] = useState<Array<{ date: string; [symbol: string]: number | string }>>(providedHistoricalData || []);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  useEffect(() => {
    if (!providedData) {
      console.log(`Loading sample data for type: ${sampleType}`);
      // Load sample data for testing
      const sample = getSampleData(sampleType);
      setData(sample.data);
      setCouponSchedule(sample.couponSchedule || []);
      
      // Fetch real market data asynchronously
      loadRealMarketData(sample.data);
    }
  }, [providedData, sampleType]);
  
  const loadRealMarketData = async (productData: ProductLifecycleData) => {
    setDataLoading(true);
    console.log('=== LOADING REAL MARKET DATA ===');
    console.log('Product data:', productData.productDisplayName);
    
    try {
      const symbols = productData.underlyings.map(u => u.symbol);
      console.log('Symbols to fetch:', symbols);
      
      // Fetch current quotes FIRST
      console.log('Fetching current quotes...');
      const quotes = await fetchCurrentQuotes(symbols);
      console.log('Quotes fetched:', quotes);
      
      // Fetch historical prices from initial fixing date to today
      const fromDate = productData.initialFixingDate;
      const toDate = new Date().toISOString().split('T')[0];
      console.log(`Fetching historical prices from ${fromDate} to ${toDate}...`);
      const historical = await fetchHistoricalPrices(symbols, fromDate, toDate);
      console.log(`Historical data fetched: ${historical.length} days`);
      
      if (historical.length > 0) {
        setHistoricalData(historical);
        console.log('Historical data state updated');
      }
      
      // Update current prices in data
      console.log('Updating current prices...');
      const updatedUnderlyings = productData.underlyings.map(u => {
        const fetchedPrice = quotes[u.symbol];
        const currentPrice = fetchedPrice || u.currentPrice;
        const performancePct = ((currentPrice / u.initialPrice) - 1) * 100;
        
        console.log(`${u.symbol}: initial=${u.initialPrice}, fetched=${fetchedPrice}, current=${currentPrice}, perf=${performancePct.toFixed(2)}%`);
        
        return {
          ...u,
          currentPrice,
          performancePct,
        };
      });
      
      // Recalculate worst/best performer indices
      const performanceValues = updatedUnderlyings.map(u => u.performancePct);
      const worstPerformerIndex = performanceValues.indexOf(Math.min(...performanceValues));
      const bestPerformerIndex = performanceValues.indexOf(Math.max(...performanceValues));
      
      const updatedData = {
        ...productData,
        underlyings: updatedUnderlyings,
        worstPerformerIndex,
        bestPerformerIndex,
      };
      
      console.log('Setting updated data with new prices');
      console.log('Worst performer:', updatedUnderlyings[worstPerformerIndex]?.symbol);
      console.log('Best performer:', updatedUnderlyings[bestPerformerIndex]?.symbol);
      setData(updatedData);
      setLastRefresh(new Date());
      console.log('=== MARKET DATA LOADED SUCCESSFULLY ===');
    } catch (error) {
      console.error('Error loading real market data:', error);
    } finally {
      setDataLoading(false);
    }
  };
  
  const handleRefreshData = () => {
    if (data) {
      loadRealMarketData(data);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-grad)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-text-secondary">Loading lifecycle data...</div>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-grad)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">No Product Data</h2>
          <p className="text-text-secondary mb-6">
            Please select a product to view its lifecycle.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-grad)' }}>
      {/* Top Navigation */}
      <div className="bg-surface border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </a>
              <span className="text-muted">|</span>
              <h1 className="text-lg font-bold text-text-primary">Product Lifecycle</h1>
            </div>
            
            {/* Sample selector (only show if using sample data) */}
            {!providedData && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-tertiary font-semibold uppercase tracking-wide">
                  Sample:
                </span>
                <select
                  value={sampleType}
                  onChange={(e) => setSampleType(e.target.value as SampleType)}
                  className="px-3 py-1.5 bg-white border border-border rounded-lg text-sm font-semibold text-text-primary hover:shadow-sm transition-all"
                >
                  <option value="regular_income">Regular Income (RC)</option>
                  <option value="capital_protection">Capital Protection (CPPN)</option>
                  <option value="boosted_growth">Boosted Growth (Bonus)</option>
                </select>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshData}
                disabled={dataLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-semibold text-text-primary hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-semibold text-text-primary hover:shadow-md transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Data Loading Indicator */}
        {dataLoading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            <div className="text-sm text-blue-900 font-medium">
              Fetching live market data from FMP...
            </div>
          </div>
        )}
        
        {/* Last Refresh Indicator */}
        {lastRefresh && !dataLoading && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-green-900">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <strong>Live data updated:</strong>
              <span>{lastRefresh.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {/* 1. Hero */}
          <LifecycleHero data={data} />
          
          {/* 2. KPI Grid */}
          <KPIGrid data={data} />
          
          {/* 2.5. AI Insights Card */}
          <AIInsightsCard data={data} />
          
          {/* 3. Timeline Bar */}
          <TimelineBar data={data} />
          
          {/* 4. Underlyings Table */}
          <UnderlyingsTable data={data} />
          
          {/* 5. Chart */}
          <TriggerChart data={data} historicalData={historicalData} />
          
          {/* 6. Cashflows */}
          <CashflowsTable data={data} couponSchedule={couponSchedule} notional={notional} />
          
          {/* 7. Outcome Cards */}
          <OutcomeCards data={data} />
          
          {/* 8. Calculations Card */}
          <CalculationsCard data={data} />
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-border bg-surface/50 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted">
            <p className="mb-2">
              Powered by <span className="font-semibold text-valura-ink">Valura</span>
            </p>
            <p className="text-xs">
              Market data and calculations are indicative. Not investment advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
