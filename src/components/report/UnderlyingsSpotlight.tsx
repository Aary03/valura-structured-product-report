/**
 * Underlyings Spotlight Component
 * Grid of individual cards for each underlying
 */

import { useState, useEffect } from 'react';
import type { UnderlyingData } from '../../services/api/mappers';
import type { HistoricalPricePoint } from '../../services/api/mappers';
import type { ProductTerms } from '../../hooks/useReportGenerator';
import { buildUnderlyingSummary, type UnderlyingSummary } from '../../services/underlyingSummary';
import { UnderlyingCard } from './UnderlyingCard';
import { SectionHeader } from '../common/SectionHeader';
import { RefreshCw } from 'lucide-react';
import { CardShell } from '../common/CardShell';

interface UnderlyingsSpotlightProps {
  underlyingData: UnderlyingData[];
  historicalData: HistoricalPricePoint[][];
  terms: ProductTerms;
  worstUnderlyingIndex: number | null;
  pdfMode?: boolean;
  onSummariesLoaded?: (summaries: UnderlyingSummary[]) => void;
}

export function UnderlyingsSpotlight({
  underlyingData,
  historicalData,
  terms,
  worstUnderlyingIndex,
  pdfMode = false,
  onSummariesLoaded,
}: UnderlyingsSpotlightProps) {
  const [summaries, setSummaries] = useState<UnderlyingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummaries() {
      if (underlyingData.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const thresholdPct =
          terms.productType === 'RC'
            ? (terms.barrierPct || terms.strikePct || 0.7)
            : (terms.participationStartPct / 100);
        const thresholdLabel =
          terms.productType === 'RC'
            ? 'Barrier'
            : 'Participation Start';
        
        const summaryPromises = underlyingData.map(async (data, index) => {
          const initialFixing = data.initialFixing || data.currentPrice;
          const historical = historicalData[index] || [];
          
          try {
            return await buildUnderlyingSummary(
              data.symbol,
              initialFixing,
              thresholdPct,
              historical,
              { thresholdLabel }
            );
          } catch (err) {
            console.error(`Error building summary for ${data.symbol}:`, err);
            // Return a minimal summary on error
            return {
              symbol: data.symbol,
              name: data.name || data.symbol,
              logoUrl: '',
              spotPrice: data.currentPrice,
              initialFixing,
              performancePct: ((data.currentPrice / initialFixing) - 1) * 100,
              distanceToBarrierPctPts: ((data.currentPrice / initialFixing) - thresholdPct) * 100,
              thresholdLabel,
              insight: 'Data loading in progress...',
            } as UnderlyingSummary;
          }
        });

        const results = await Promise.all(summaryPromises);
        setSummaries(results);
        onSummariesLoaded?.(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load underlying summaries');
        console.error('Error fetching summaries:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummaries();
  }, [underlyingData, historicalData, terms]);

  if (loading) {
    return (
      <CardShell className="p-6">
        <SectionHeader title="Underlying Spotlights" />
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-text-secondary">Loading underlying data...</span>
        </div>
      </CardShell>
    );
  }

  if (error) {
    return (
      <CardShell className="p-6">
        <SectionHeader title="Underlying Spotlights" />
        <div className="text-center py-8 text-danger">
          <p>Error loading underlying data: {error}</p>
        </div>
      </CardShell>
    );
  }

  if (summaries.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <SectionHeader
        title="Underlying Spotlights"
        subtitle={pdfMode ? undefined : "Comprehensive metrics and risk analysis for each underlying"}
      />
      <div
        className={`mt-4 ${
          summaries.length === 1
            ? 'max-w-3xl mx-auto'
            : 'w-full'
        }`}
      >
        <div
          className={`grid gap-4 ${
            summaries.length === 1
              ? 'grid-cols-1'
              : pdfMode
              ? 'grid-cols-1'
              : 'grid-cols-1'
          }`}
        >
          {summaries.map((summary, index) => (
            <UnderlyingCard
              key={summary.symbol}
              summary={summary}
              isWorstOf={worstUnderlyingIndex !== null && index === worstUnderlyingIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

