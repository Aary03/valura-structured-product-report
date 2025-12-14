/**
 * PDF Export Utility
 * Converts the report to PDF while preserving colors and styling
 */

import html2pdf from 'html2pdf.js';
import type { ReportData } from '../hooks/useReportGenerator';

interface PDFOptions {
  filename?: string;
  margin?: number | [number, number] | [number, number, number, number];
  format?: 'a4' | 'letter' | [number, number];
  orientation?: 'portrait' | 'landscape';
  headerTitle?: string;
  documentId?: string;
  generatedDate?: string;
}

export async function exportToPDF(
  element: HTMLElement,
  options: PDFOptions = {}
): Promise<void> {
  const {
    filename = 'reverse-convertible-report.pdf',
    margin = [10, 10, 10, 10] as [number, number, number, number],
    format = 'a4',
    orientation = 'portrait',
    headerTitle = 'Valura Structured Product Report',
    documentId,
    generatedDate,
  } = options;

  const opt = {
    margin,
    filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 1.25,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    },
    jsPDF: {
      unit: 'mm',
      format,
      orientation,
      compress: true,
    },
    pagebreak: {
      mode: ['css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['.no-break', 'img', 'svg'],
    },
  };

  try {
    const worker = html2pdf().set(opt).from(element).toPdf();
    const pdf = await worker.get('pdf');

    // Stamp header/footer on each page
    const pageCount = pdf.internal.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const headerY = 8;
    const footerY = pageHeight - 6;

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      // Header line
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.2);
      pdf.line(10, 12, pageWidth - 10, 12);

      // Header text
      pdf.setTextColor(30, 41, 59);
      pdf.text(headerTitle, 10, headerY);

      const dateText = generatedDate ? `Generated: ${generatedDate}` : '';
      if (dateText) {
        pdf.setTextColor(100, 116, 139);
        pdf.text(dateText, pageWidth - 10, headerY, { align: 'right' });
      }

      // Footer line
      pdf.setDrawColor(226, 232, 240);
      pdf.line(10, pageHeight - 12, pageWidth - 10, pageHeight - 12);

      // Footer text
      pdf.setTextColor(100, 116, 139);
      const leftFooter = documentId ? `Document ID: ${documentId}` : 'Not an offer • Indicative terms';
      pdf.text(leftFooter, 10, footerY);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 10, footerY, { align: 'right' });
    }

    await worker.save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Export report with custom filename
 */
export async function downloadReportPDF(
  containerId: string = 'report-container',
  filename?: string,
  meta?: { title?: string; documentId?: string; generatedDate?: string }
): Promise<void> {
  const element = document.getElementById(containerId);
  if (!element) {
    throw new Error(`Element with id "${containerId}" not found`);
  }

  // Temporarily ensure all content is visible
  const originalOverflow = element.style.overflow;
  element.style.overflow = 'visible';

  try {
    // Enable PDF mode styling
    document.body.classList.add('pdf-mode');
    await exportToPDF(element, {
      filename: filename || `reverse-convertible-report-${new Date().toISOString().split('T')[0]}.pdf`,
      margin: [10, 10, 10, 10],
      format: 'a4',
      orientation: 'portrait',
      headerTitle: meta?.title || 'Valura Structured Product Report',
      documentId: meta?.documentId,
      generatedDate: meta?.generatedDate,
    });
  } finally {
    document.body.classList.remove('pdf-mode');
    // Restore original overflow
    element.style.overflow = originalOverflow;
  }
}

/**
 * Server-side (Playwright) PDF export.
 * This hits the backend endpoint which prints the dedicated 2-page PDF route (`/?pdf=1`).
 */
export async function downloadReportPDFServer(reportData: ReportData, filename: string): Promise<void> {
  const res = await fetch('/api/reports/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reportData,
      filename,
      meta: {
        title: 'Valura Structured Product Report',
        documentId: reportData.documentId,
        generatedDate: reportData.generatedDate,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`PDF export failed (${res.status}): ${text || res.statusText}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

