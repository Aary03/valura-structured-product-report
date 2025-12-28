/**
 * AI Report Builder Page
 * Revolutionary conversational interface for creating reports
 */

import { useState } from 'react';
import { ArrowLeft, Zap, CheckCircle, Settings } from 'lucide-react';
import { ChatInterface } from '../components/ai-builder/ChatInterface';
import { LivePreview } from '../components/ai-builder/LivePreview';
import { QuickTemplates } from '../components/ai-builder/QuickTemplates';
import { ModeSelector, ModeHeaderBadge } from '../components/ai-builder/ModeSelector';
import { useAIConversation } from '../hooks/useAIConversation';
import { useReportGenerator } from '../hooks/useReportGenerator';
import type { ProductTerms } from '../hooks/useReportGenerator';
import { ReverseConvertibleReport } from '../components/report/ReverseConvertibleReport';
import { CapitalProtectedParticipationReport } from '../components/report/CapitalProtectedParticipationReport';
import valuraLogo from '../../Valura.ai - Logo (Black).png';

export function AIReportBuilder() {
  const { messages, isProcessing, context, sendMessage, completeness, mode, setMode } = useAIConversation();
  const { reportData, loading, generateReport } = useReportGenerator();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerate = async () => {
    if (completeness < 80) return;

    setIsGenerating(true);
    
    try {
      // Convert AI draft to product terms
      const { convertDraftToTerms } = await import('../services/ai/aiToTermsConverter');
      const terms = convertDraftToTerms(context.draft);
      
      if (!terms) {
        throw new Error('Failed to convert draft to terms');
      }

      // Generate report using existing pipeline
      await generateReport(terms);
      setReportGenerated(true);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate report. Please try again or use manual mode.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToManual = () => {
    if (confirm('Switch to manual mode? Your AI conversation will be lost.')) {
      window.location.hash = '';
    }
  };

  const handleTemplateSelect = (prompt: string) => {
    setShowTemplates(false);
    sendMessage(prompt);
  };

  // If report generated, show it
  if (reportGenerated && reportData) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-grad)' }}>
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-bold">Report Generated Successfully!</p>
                <p className="text-sm text-emerald-100">Created via AI in {messages.length} messages</p>
              </div>
            </div>
            <button
              onClick={() => {
                setReportGenerated(false);
                window.location.hash = 'ai-builder';
                window.location.reload();
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              Create Another
            </button>
          </div>
        </div>

        {/* Show Generated Report */}
        {reportData.productType === 'RC' ? (
          <ReverseConvertibleReport reportData={reportData} />
        ) : (
          <CapitalProtectedParticipationReport reportData={reportData} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-6">
              <img src={valuraLogo} alt="Valura.ai" className="h-8" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">AI Report Builder</h1>
                  <p className="text-xs text-slate-500">Create reports through conversation</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToManual}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Manual Mode
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Quick Templates (show only at start) */}
        {showTemplates && messages.length <= 1 && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Quick Start Templates
              </h2>
              <p className="text-slate-600">
                Choose a template or start chatting below
              </p>
            </div>
            <QuickTemplates 
              onSelectTemplate={handleTemplateSelect}
              disabled={isProcessing}
            />
            <div className="text-center mt-4">
              <button
                onClick={() => setShowTemplates(false)}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Skip templates, I'll describe what I need
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Chat Panel */}
          <div className="h-full">
            <ChatInterface
              messages={messages}
              isProcessing={isProcessing}
              onSendMessage={sendMessage}
              completeness={completeness}
              onSettingsClick={() => setShowModeSelector(!showModeSelector)}
            />
            
            {/* Mode Selector Modal */}
            {showModeSelector && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Choose AI Personality</h3>
                    <button
                      onClick={() => setShowModeSelector(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>
                  <ModeSelector
                    selectedMode={mode}
                    onModeChange={(newMode) => {
                      setMode(newMode);
                      setShowModeSelector(false);
                    }}
                    disabled={messages.length > 2}
                  />
                  {messages.length > 2 && (
                    <p className="text-sm text-amber-600 mt-4 p-3 bg-amber-50 rounded-lg">
                      ⚠️ Mode can only be changed at the start of conversation. Start a new chat to switch modes.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="h-full">
            <LivePreview
              draft={context.draft}
              completeness={completeness}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold text-indigo-900 mb-1">
                💡 Pro Tip: Be conversational!
              </p>
              <p>
                Try: "I need a 12-month reverse convertible on Apple with 70% barrier and 10% annual coupon" 
                or just chat naturally and I'll guide you through.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

