/**
 * PDF Export Utility
 * Converts the report to PDF while preserving colors and styling
 */

import html2pdf from 'html2pdf.js';

interface PDFOptions {
  filename?: string;
  margin?: number | number[];
  format?: 'a4' | 'letter' | [number, number];
  orientation?: 'portrait' | 'landscape';
}

export async function exportToPDF(
  element: HTMLElement,
  options: PDFOptions = {}
): Promise<void> {
  const {
    filename = 'reverse-convertible-report.pdf',
    margin = [10, 10, 10, 10],
    format = 'a4',
    orientation = 'portrait',
  } = options;

  const opt = {
    margin,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
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
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['.no-break', 'img', '.chart-container'],
    },
  };

  try {
    await html2pdf().set(opt).from(element).save();
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
  filename?: string
): Promise<void> {
  const element = document.getElementById(containerId);
  if (!element) {
    throw new Error(`Element with id "${containerId}" not found`);
  }

  // Temporarily ensure all content is visible
  const originalOverflow = element.style.overflow;
  element.style.overflow = 'visible';

  try {
    await exportToPDF(element, {
      filename: filename || `reverse-convertible-report-${new Date().toISOString().split('T')[0]}.pdf`,
      margin: [15, 15, 15, 15],
      format: 'a4',
      orientation: 'portrait',
    });
  } finally {
    // Restore original overflow
    element.style.overflow = originalOverflow;
  }
}

