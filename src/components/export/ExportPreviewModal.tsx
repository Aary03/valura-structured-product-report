/**
 * Export Preview Modal
 * Shows AI-generated content before download
 */

import { useState } from 'react';
import { X, Copy, Download, CheckCircle, Sparkles } from 'lucide-react';
import type { ExportFormat } from './ExportDropdown';

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  format: ExportFormat;
  content: string;
  productName: string;
  onDownload: () => void;
}

const formatLabels: Record<ExportFormat, string> = {
  'client-email': 'Client Email',
  'executive-summary': 'Executive Summary',
  'investment-memo': 'Investment Memo',
  'faq-sheet': 'FAQ Sheet',
  'meeting-prep': 'Meeting Prep Pack',
};

export function ExportPreviewModal({
  isOpen,
  onClose,
  format,
  content,
  productName,
  onDownload,
}: ExportPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    onDownload();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-800">
                {formatLabels[format]}
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              AI-generated for {productName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
              {content}
            </pre>
          </div>

          {/* AI Notice */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">AI-Generated Content</p>
                <p className="text-amber-700">
                  Please review and customize this content before sending to clients. 
                  While AI strives for accuracy, you should verify all facts and tailor 
                  the tone to your specific relationship.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white rounded-lg border border-slate-300 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Download as TXT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

