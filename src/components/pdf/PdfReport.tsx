/**
 * PDF-only 2-page layout (A4)
 * Rendered via `/?pdf=1` and intended to be printed server-side.
 */

import { useEffect, useState } from 'react';
import type { ReportData } from '../../hooks/useReportGenerator';
import { PdfReverseConvertibleReport } from './PdfReverseConvertibleReport';
import { PdfCapitalProtectedParticipationReport } from './PdfCapitalProtectedParticipationReport';

import '../../styles/pdf.css';

declare global {
  interface Window {
    __PDF_READY__?: boolean;
  }
}

function readLastReport(): ReportData | null {
  try {
    const raw = sessionStorage.getItem('valura:lastReport');
    if (!raw) return null;
    return JSON.parse(raw) as ReportData;
  } catch {
    return null;
  }
}

export function PdfReport() {
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    setReportData(readLastReport());
  }, []);

  if (!reportData) {
    return (
      <div className="pdf-root">
        <div className="pdf-page">
          <div className="pdf-card" style={{ width: '100%' }}>
            <div className="pdf-section-title">PDF layout</div>
            <div className="pdf-muted pdf-mini">
              No report data found. Generate a report first, then export PDF.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reportData.productType === 'RC') {
    return <PdfReverseConvertibleReport reportData={reportData} />;
  }
  return <PdfCapitalProtectedParticipationReport reportData={reportData} />;
}
