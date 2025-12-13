/**
 * Reverse Convertible Report Container
 * Main container rendering all report sections
 */

import type { ReportData } from '../../hooks/useReportGenerator';
import { HeroHeader } from './HeroHeader';
import { OneMinuteSummary } from './OneMinuteSummary';
import { KeyDates } from './KeyDates';
import { ProductSummary } from './ProductSummary';
import { SuitabilitySection } from './SuitabilitySection';
import { UnderlyingsTable } from './UnderlyingsTable';
import { UnderlyingsSpotlight } from './UnderlyingsSpotlight';
import { PayoffGraph } from './PayoffGraph';
import { PerformanceGraph } from './PerformanceGraph';
import { OutcomeExamples } from './OutcomeExamples';
import { BreakEvenCard } from './BreakEvenCard';
import { ScenarioFlowchart } from '../scenarios/ScenarioFlowchart';
import { buildRCFlow } from '../scenarios/builders/buildRCFlow';
import { Risks } from './Risks';
import { Footer } from './Footer';
import { normalizeLevel } from '../../products/common/basket';
import { addMonths, getCurrentISODate } from '../../core/types/dates';
import { Download } from 'lucide-react';
import { downloadReportPDF } from '../../utils/pdfExport';
import { useState } from 'react';

interface ReverseConvertibleReportProps {
  reportData: ReportData;
}

export function ReverseConvertibleReport({ reportData }: ReverseConvertibleReportProps) {
  const { terms, underlyingData, historicalData, curvePoints, intrinsicValue, barrierLevel, strikeLevel, documentId, generatedDate } = reportData;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Calculate current worst-of level (or single level)
  const currentLevel = reportData.worstOfLevel || 
    (underlyingData.length > 0
      ? normalizeLevel(
          underlyingData[0].currentPrice,
          underlyingData[0].initialFixing || underlyingData[0].currentPrice
        )
      : 1.0);

  // Get underlying symbols
  const underlyingSymbols = underlyingData.map((d) => d.symbol);

  // Build initial fixings map
  const initialFixings: Record<string, number> = {};
  underlyingData.forEach((data) => {
    initialFixings[data.symbol] = data.initialFixing || data.currentPrice;
  });

  // Calculate maturity date
  const maturityDate = addMonths(getCurrentISODate(), terms.tenorMonths);
  const pricingDate = getCurrentISODate();

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const filename = `reverse-convertible-${terms.underlyings.map(u => u.ticker).join('-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      await downloadReportPDF('report-container', filename);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-grad)' }}>
      <div id="report-container" className="max-w-7xl mx-auto px-6 py-8 space-y-4">
        {/* PDF Download Button */}
        <div className="flex justify-end mb-4 no-print">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center space-x-2 px-6 py-3 bg-valura-ink text-white rounded-md font-semibold transition-colors hover:bg-valura-mint-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-card"
          >
            <Download className="w-5 h-5" />
            <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      {/* Hero Header with KPIs */}
      <HeroHeader
        terms={terms}
        currentWorstOfLevel={currentLevel}
        barrierLevel={barrierLevel}
        worstUnderlyingIndex={reportData.worstUnderlyingIndex}
      />

      {/* One-Minute Summary */}
      <OneMinuteSummary
        terms={terms}
        timestamp={reportData.generatedDate}
      />

      {/* Key Dates */}
      <KeyDates
        pricingDate={pricingDate}
        couponSchedule={reportData.couponSchedule}
        maturityDate={maturityDate}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4 flex flex-col">
          <ProductSummary terms={terms} />
          <SuitabilitySection />
        </div>

        {/* Right Column */}
        <div className="flex flex-col">
          <UnderlyingsTable
            underlyingData={underlyingData}
            historicalData={historicalData}
            initialFixings={initialFixings}
            terms={terms}
            referencePrices={reportData.referencePrices}
            worstUnderlyingIndex={reportData.worstUnderlyingIndex}
          />
        </div>
      </div>

      {/* Underlyings Spotlight - Full Width */}
      <UnderlyingsSpotlight
        underlyingData={underlyingData}
        historicalData={historicalData}
        terms={terms}
        worstUnderlyingIndex={reportData.worstUnderlyingIndex}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PayoffGraph
          curvePoints={curvePoints}
          barrierLevel={barrierLevel}
          strikeLevel={strikeLevel}
          intrinsicValue={intrinsicValue}
          currentLevel={currentLevel}
          variant={terms.variant}
          breakEvenPct={reportData.breakEvenPct}
        />
        <PerformanceGraph
          historicalData={historicalData}
          underlyingSymbols={underlyingSymbols}
          barrierLevel={barrierLevel}
          strikeLevel={strikeLevel}
          initialFixings={initialFixings}
          basketType={terms.basketType}
          worstUnderlyingIndex={reportData.worstUnderlyingIndex}
        />
      </div>

      {/* Outcome Examples and Break-Even */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OutcomeExamples
          terms={terms}
          notional={terms.notional}
          barrierPct={barrierLevel}
          breakEvenPct={reportData.breakEvenPct}
        />
        <BreakEvenCard
          terms={terms}
          notional={terms.notional}
        />
      </div>

      {/* Scenarios Flowchart - Full Width */}
      <ScenarioFlowchart
        flow={buildRCFlow(terms, {
          basketType: terms.basketType,
          worstOfLabel: terms.basketType === 'worst_of' ? 'Worst-Of' : undefined,
          barrierPct: barrierLevel,
          strikePct: strikeLevel,
          gearing: reportData.payoffResult?.gearing,
          conversionRatio: terms.conversionRatio,
          settlement: 'cash/physical',
        })}
      />

      {/* Risks */}
      <Risks />

      {/* Footer */}
      <Footer date={generatedDate} documentId={documentId} />
      </div>
    </div>
  );
}

