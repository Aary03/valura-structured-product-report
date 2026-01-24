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
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { getSampleData, type SampleType } from '../data/lifecycleSamples';

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
  historicalData = [],
}: LifecyclePageProps) {
  // Sample selector for testing
  const [sampleType, setSampleType] = useState<SampleType>('regular_income');
  const [data, setData] = useState<ProductLifecycleData | null>(providedData || null);
  const [couponSchedule, setCouponSchedule] = useState<CouponSchedule[]>(providedCouponSchedule || []);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!providedData) {
      // Load sample data for testing
      const sample = getSampleData(sampleType);
      setData(sample.data);
      setCouponSchedule(sample.couponSchedule || []);
    }
  }, [providedData, sampleType]);
  
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
        <div className="space-y-6">
          {/* 1. Hero */}
          <LifecycleHero data={data} />
          
          {/* 2. KPI Grid */}
          <KPIGrid data={data} />
          
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
