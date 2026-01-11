/**
 * Capital Protected Participation Note Report
 * Separate report flow from Reverse Convertible.
 */

import { useMemo, useState } from 'react';
import type { CapitalProtectedParticipationReportData } from '../../hooks/useReportGenerator';
import { Download } from 'lucide-react';
import { downloadReportPDFServer } from '../../utils/pdfExport';
import { normalizeLevel } from '../../products/common/basket';
import { addMonths, getCurrentISODate } from '../../core/types/dates';
import { CppnHeroHeader } from './CppnHeroHeader';
import { CppnOneMinuteSummary } from './CppnOneMinuteSummary';
import { KeyDates } from './KeyDates';
import { CppnProductSummary } from './CppnProductSummary';
import { UnderlyingsTable } from './UnderlyingsTable';
import { SuitabilitySection } from './SuitabilitySection';
import { UnderlyingsSpotlight } from './UnderlyingsSpotlight';
import { CompanyDescriptions } from './CompanyDescriptions';
import { CppnPayoffGraph } from './CppnPayoffGraph';
import { PerformanceGraph } from './PerformanceGraph';
import { CppnOutcomeExamples } from './CppnOutcomeExamples';
import { CppnBreakEvenCard } from './CppnBreakEvenCard';
import { ScenarioFlowchart } from '../scenarios/ScenarioFlowchart';
import { buildCPPNFlow } from '../scenarios/builders/buildCPPNFlow';
import { Risks } from './Risks';
import { Footer } from './Footer';
import { TickerNewsSection } from '../news/TickerNewsSection';
import type { UnderlyingSummary } from '../../services/underlyingSummary';
import { ExportDropdown } from '../export/ExportDropdown';
import { ExportPreviewModal } from '../export/ExportPreviewModal';
import type { ExportFormat } from '../export/ExportDropdown';
import { useAIContentGeneration } from '../../hooks/useAIContentGeneration';
import { downloadAsDocument } from '../../utils/exportContent';

interface CapitalProtectedParticipationReportProps {
  reportData: CapitalProtectedParticipationReportData;
}

export function CapitalProtectedParticipationReport({ reportData }: CapitalProtectedParticipationReportProps) {
  const { terms, underlyingData, historicalData, curvePoints } = reportData;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [summaries, setSummaries] = useState<UnderlyingSummary[]>([]);
  
  // AI Content Generation
  const { content: aiContent, isGenerating: isGeneratingAI, isReady: aiReady } = useAIContentGeneration(reportData);
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; format: ExportFormat; content: string } | null>(null);

  const currentLevelPct = useMemo(() => {
    if (typeof reportData.basketLevelPct === 'number') return reportData.basketLevelPct;
    if (underlyingData.length === 0) return null;
    const level = normalizeLevel(
      underlyingData[0].currentPrice,
      underlyingData[0].initialFixing || underlyingData[0].currentPrice
    );
    return level * 100;
  }, [reportData.basketLevelPct, underlyingData]);

  // Build initial fixings map (for table/chart components expecting map)
  const initialFixings: Record<string, number> = {};
  underlyingData.forEach((data) => {
    initialFixings[data.symbol] = data.initialFixing || data.currentPrice;
  });

  const maturityDate = addMonths(getCurrentISODate(), terms.tenorMonths);
  const pricingDate = getCurrentISODate();

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const filename = `capital-protected-participation-${terms.underlyings.map((u) => u.ticker).join('-')}-${new Date()
        .toISOString()
        .split('T')[0]}.pdf`;
      await downloadReportPDFServer(reportData, filename);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Make sure the PDF server is running, then try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExport = (format: ExportFormat, content: string) => {
    setPreviewModal({ isOpen: true, format, content });
  };

  const handleDownloadExport = () => {
    if (!previewModal) return;
    const productName = terms.bonusEnabled 
      ? 'Bonus Certificate' 
      : 'Capital Protected Participation Note';
    downloadAsDocument(previewModal.content, previewModal.format, productName);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-grad)' }}>
      <div id="report-container" className="report-root max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-end gap-3 mb-6 no-print">
          <ExportDropdown
            content={aiContent}
            isGenerating={isGeneratingAI}
            isReady={aiReady}
            productName={terms.bonusEnabled ? 'Bonus Certificate' : 'Capital Protected Participation Note'}
            onExport={handleExport}
          />
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="btn-primary flex items-center space-x-2 px-8 py-3.5 text-base"
            style={{ boxShadow: 'var(--shadow-button)' }}
          >
            <Download className="w-5 h-5" />
            <span className="font-semibold">{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
        <div className="no-print text-xs text-text-secondary text-right -mt-4 mb-2">
          PDF export uses the dedicated 2-page layout. Start the PDF server with <span className="font-mono">npm run pdf:server</span>.
        </div>

        <div className="report-stack flex flex-col gap-4">
          {/* Hero Header */}
          <CppnHeroHeader terms={terms} />

          {/* One-Minute Summary */}
          <CppnOneMinuteSummary terms={terms} timestamp={reportData.generatedDate} />

          {/* Key Dates (no coupons for CPPN, but keep section) */}
          <KeyDates pricingDate={pricingDate} couponSchedule={[]} maturityDate={maturityDate} />

          {/* Top Row: Product + Underlyings Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pdf-single-col">
            <CppnProductSummary terms={terms} />
            <UnderlyingsTable
              underlyingData={underlyingData}
              historicalData={historicalData}
              initialFixings={initialFixings}
              terms={terms}
              referencePrices={reportData.referencePrices}
              worstUnderlyingIndex={terms.basketType === 'worst_of' ? reportData.worstUnderlyingIndex : null}
            />
          </div>

          {/* Suitability */}
          <SuitabilitySection productType="CPPN" />

          {/* Underlyings Spotlight - REMOVED: Now integrated into Combined Cards below */}
          {/* The new UnderlyingCombinedCard includes all spotlight metrics in tabs */}
          <div style={{ display: 'none' }}>
            <UnderlyingsSpotlight
              underlyingData={underlyingData}
              historicalData={historicalData}
              terms={terms}
              worstUnderlyingIndex={terms.basketType === 'worst_of' ? reportData.worstUnderlyingIndex : null}
              onSummariesLoaded={setSummaries}
            />
          </div>

          {/* Underlying Analysis Hub - Full Width (Combines Spotlight + Company Info) */}
          {summaries.length > 0 && (
            <CompanyDescriptions 
              summaries={summaries} 
              productType="CPPN"
              barrierPct={terms.knockInEnabled ? terms.knockInBarrier : 0}
              productTerms={terms}
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
            <CppnPayoffGraph
              curvePoints={curvePoints}
              capitalProtectionPct={terms.capitalProtectionPct}
              participationStartPct={terms.participationStartPct}
              capType={terms.capType}
              capLevelPct={terms.capLevelPct}
              knockInEnabled={terms.knockInEnabled}
              knockInLevelPct={terms.knockInLevelPct}
              downsideStrikePct={terms.downsideStrikePct ?? terms.knockInLevelPct}
              currentLevelPct={currentLevelPct}
              bonusEnabled={terms.bonusEnabled}
            />
            <PerformanceGraph
              historicalData={historicalData}
              underlyingSymbols={underlyingData.map((d) => d.symbol)}
              barrierLevel={0}
              strikeLevel={undefined}
              initialFixings={initialFixings}
              basketType={terms.basketType === 'worst_of' ? 'worst_of' : 'single'}
              worstUnderlyingIndex={terms.basketType === 'worst_of' ? reportData.worstUnderlyingIndex : null}
            />
          </div>

          {/* Outcome Examples and Break-Even */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CppnOutcomeExamples terms={terms} notional={terms.notional} />
            <CppnBreakEvenCard terms={terms} />
          </div>

          {/* Scenarios Flowchart */}
          <ScenarioFlowchart flow={buildCPPNFlow(terms)} />

          {/* Risks */}
          <Risks productType="CPPN" kiEnabled={terms.knockInEnabled} />

          {/* Footer */}
          <Footer date={reportData.generatedDate} documentId={reportData.documentId} />
        </div>
      </div>

      {/* Export Preview Modal */}
      {previewModal && (
        <ExportPreviewModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal(null)}
          format={previewModal.format}
          content={previewModal.content}
          productName={terms.bonusEnabled ? 'Bonus Certificate' : 'Capital Protected Participation Note'}
          onDownload={handleDownloadExport}
        />
      )}
    </div>
  );
}


