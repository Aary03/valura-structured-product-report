/**
 * Reverse Convertible Report Container
 * Main container rendering all report sections
 */

import type { ReverseConvertibleReportData } from '../../hooks/useReportGenerator';
import { HeroHeader } from './HeroHeader';
import { OneMinuteSummary } from './OneMinuteSummary';
import { KeyDates } from './KeyDates';
import { ProductSummary } from './ProductSummary';
import { SuitabilitySection } from './SuitabilitySection';
import { UnderlyingsTable } from './UnderlyingsTable';
import { UnderlyingsSpotlight } from './UnderlyingsSpotlight';
import { CompanyDescriptions } from './CompanyDescriptions';
import { PayoffGraph } from './PayoffGraph';
import { PerformanceGraph } from './PerformanceGraph';
import { OutcomeExamples } from './OutcomeExamples';
import { BreakEvenCard } from './BreakEvenCard';
import { ScenarioFlowchart } from '../scenarios/ScenarioFlowchart';
import { buildRCFlow } from '../scenarios/builders/buildRCFlow';
import { Risks } from './Risks';
import { Footer } from './Footer';
import { TickerNewsSection } from '../news/TickerNewsSection';
import { normalizeLevel } from '../../products/common/basket';
import { addMonths, getCurrentISODate } from '../../core/types/dates';
import { Download } from 'lucide-react';
import { downloadReportPDFServer } from '../../utils/pdfExport';
import { useState } from 'react';
import type { UnderlyingSummary } from '../../services/underlyingSummary';

interface ReverseConvertibleReportProps {
  reportData: ReverseConvertibleReportData;
}

export function ReverseConvertibleReport({ reportData }: ReverseConvertibleReportProps) {
  const { terms, underlyingData, historicalData, curvePoints, intrinsicValue, barrierLevel, strikeLevel, documentId, generatedDate } = reportData;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [summaries, setSummaries] = useState<UnderlyingSummary[]>([]);

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
      await downloadReportPDFServer(reportData, filename);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Make sure the PDF server is running, then try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-grad)' }}>
      <div id="report-container" className="report-root max-w-7xl mx-auto px-6 py-8">
        {/* PDF Download Button */}
        <div className="flex justify-end mb-6 no-print">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="btn-primary flex items-center space-x-2 px-8 py-3.5 text-base"
            style={{
              boxShadow: 'var(--shadow-button)',
            }}
          >
            <Download className="w-5 h-5" />
            <span className="font-semibold">{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
        <div className="no-print text-xs text-text-secondary text-right -mt-4 mb-2">
          PDF export uses the dedicated 2-page layout. Start the PDF server with <span className="font-mono">npm run pdf:server</span>.
        </div>
        <div className="report-stack flex flex-col gap-4">
          {/* Hero Header with KPIs */}
          <HeroHeader
            terms={terms}
            currentWorstOfLevel={currentLevel}
            barrierLevel={barrierLevel}
            worstUnderlyingIndex={reportData.worstUnderlyingIndex}
          />

          {/* One-Minute Summary */}
          <OneMinuteSummary terms={terms} timestamp={reportData.generatedDate} />

          {/* Key Dates */}
          <KeyDates
            pricingDate={pricingDate}
            couponSchedule={reportData.couponSchedule}
            maturityDate={maturityDate}
          />

          {/* Top Row: Product + Underlyings Table (prevents awkward empty right column) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pdf-single-col">
            <ProductSummary terms={terms} />
            <UnderlyingsTable
              underlyingData={underlyingData}
              historicalData={historicalData}
              initialFixings={initialFixings}
              terms={terms}
              referencePrices={reportData.referencePrices}
              worstUnderlyingIndex={reportData.worstUnderlyingIndex}
            />
          </div>

          {/* Suitability - Full Width */}
          <SuitabilitySection />

          {/* Underlyings Spotlight - Full Width */}
          <UnderlyingsSpotlight
            underlyingData={underlyingData}
            historicalData={historicalData}
            terms={terms}
            worstUnderlyingIndex={reportData.worstUnderlyingIndex}
            onSummariesLoaded={setSummaries}
          />

          {/* Company Backgrounds - Full Width */}
          {summaries.length > 0 && (
            <CompanyDescriptions 
              summaries={summaries} 
              productType="RC"
              barrierPct={terms.barrier}
            />
          )}

          {/* Ticker News Sections */}
          <div className="space-y-4">
            {underlyingData.map((data) => (
              <TickerNewsSection
                key={data.symbol}
                symbol={data.symbol}
                companyName={data.name}
                defaultExpanded={false}
                maxArticles={5}
              />
            ))}
          </div>

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
            <BreakEvenCard terms={terms} notional={terms.notional} />
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

          {/* Footer (screen only; PDF gets stamped header/footer) */}
          <Footer date={generatedDate} documentId={documentId} />
        </div>
      </div>
    </div>
  );
}

