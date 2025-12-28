/**
 * Beautiful Export Dropdown Component
 * One-click exports with AI-generated content
 */

import { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Mail, 
  FileText, 
  FileCheck, 
  HelpCircle, 
  MessageSquare,
  CheckCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { GeneratedContent } from '../../services/ai/aiContentGenerator';

interface ExportDropdownProps {
  content: GeneratedContent | null;
  isGenerating: boolean;
  isReady: boolean;
  productName: string;
  onExport: (format: ExportFormat, content: string) => void;
}

export type ExportFormat = 
  | 'client-email'
  | 'executive-summary'
  | 'investment-memo'
  | 'faq-sheet'
  | 'meeting-prep';

interface ExportOption {
  id: ExportFormat;
  icon: typeof Mail;
  label: string;
  description: string;
  contentKey: keyof GeneratedContent;
}

const exportOptions: ExportOption[] = [
  {
    id: 'client-email',
    icon: Mail,
    label: 'Client Email',
    description: 'Ready-to-send professional email',
    contentKey: 'clientEmail',
  },
  {
    id: 'executive-summary',
    icon: FileText,
    label: 'Executive Summary',
    description: '1-page overview for decision makers',
    contentKey: 'executiveSummary',
  },
  {
    id: 'investment-memo',
    icon: FileCheck,
    label: 'Investment Memo',
    description: 'Formal approval document',
    contentKey: 'investmentMemo',
  },
  {
    id: 'faq-sheet',
    icon: HelpCircle,
    label: 'FAQ Sheet',
    description: 'Common questions & answers',
    contentKey: 'faqSheet',
  },
  {
    id: 'meeting-prep',
    icon: MessageSquare,
    label: 'Meeting Prep Pack',
    description: 'Talking points & objection handlers',
    contentKey: 'meetingPrep',
  },
];

export function ExportDropdown({
  content,
  isGenerating,
  isReady,
  productName,
  onExport,
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExport = (format: ExportFormat, contentKey: keyof GeneratedContent) => {
    if (!content) return;
    
    const exportContent = content[contentKey];
    onExport(format, exportContent);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 transform hover:scale-[1.02]"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating AI Content...</span>
          </>
        ) : isReady ? (
          <>
            <Download className="w-4 h-4" />
            <span>Export</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <CheckCircle className="w-3.5 h-3.5 text-emerald-300 absolute -top-1 -right-1" />
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Export</span>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-800">
                AI-Generated Exports
              </span>
              {isReady && (
                <span className="ml-auto text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Ready
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Professional documents created instantly
            </p>
          </div>

          {/* Options List */}
          <div className="max-h-96 overflow-y-auto">
            {isGenerating ? (
              <div className="px-4 py-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
                <p className="text-sm font-medium text-slate-700">
                  AI is preparing your exports...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  This usually takes 10-15 seconds
                </p>
              </div>
            ) : !content ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-slate-600">
                  Content not available
                </p>
              </div>
            ) : (
              exportOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleExport(option.id, option.contentKey)}
                    className={`w-full px-4 py-3.5 flex items-start gap-3 hover:bg-indigo-50 transition-colors duration-150 ${
                      index !== 0 ? 'border-t border-slate-100' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-indigo-700" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                        {option.label}
                        {isReady && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {option.description}
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {isReady && (
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Generated by AI · Customize before sending</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

