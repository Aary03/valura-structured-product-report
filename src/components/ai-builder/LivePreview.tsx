/**
 * Live Preview Panel
 * Shows report being built in real-time as user chats with AI
 */

import { CheckCircle, Circle, Loader2, Sparkles, FileText } from 'lucide-react';
import type { ReportDraft } from '../../services/ai/aiReportAssistant';

interface LivePreviewProps {
  draft: ReportDraft;
  completeness: number;
  onGenerate: () => void;
  isGenerating: boolean;
}

interface Field {
  label: string;
  value: string | undefined;
  required: boolean;
  status: 'complete' | 'pending' | 'missing';
}

export function LivePreview({
  draft,
  completeness,
  onGenerate,
  isGenerating,
}: LivePreviewProps) {
  const params = draft.parameters as any;

  // Build fields list based on product type
  const fields: Field[] = [
    {
      label: 'Product Type',
      value: draft.productType === 'RC' 
        ? 'Reverse Convertible' 
        : draft.productType === 'CPPN' 
          ? 'Capital Protected Note' 
          : draft.productType === 'Bonus'
            ? 'Bonus Certificate'
            : undefined,
      required: true,
      status: draft.productType ? 'complete' : 'missing',
    },
    {
      label: 'Underlying(s)',
      value: draft.underlyings?.map(u => u.ticker).join(', '),
      required: true,
      status: draft.underlyings && draft.underlyings.length > 0 ? 'complete' : 'missing',
    },
    {
      label: 'Notional Amount',
      value: params?.notional ? `$${params.notional.toLocaleString()}` : undefined,
      required: true,
      status: params?.notional ? 'complete' : 'missing',
    },
    {
      label: 'Tenor',
      value: params?.tenorMonths ? `${params.tenorMonths} months` : undefined,
      required: true,
      status: params?.tenorMonths ? 'complete' : 'missing',
    },
  ];

  // Add product-specific fields
  if (draft.productType === 'RC') {
    fields.push(
      {
        label: 'Barrier Level',
        value: params?.barrierPct ? `${(params.barrierPct * 100).toFixed(0)}%` : params?.strikePct ? `${(params.strikePct * 100).toFixed(0)}%` : undefined,
        required: true,
        status: params?.barrierPct || params?.strikePct ? 'complete' : 'missing',
      },
      {
        label: 'Annual Coupon',
        value: params?.couponRatePA ? `${(params.couponRatePA * 100).toFixed(1)}%` : undefined,
        required: true,
        status: params?.couponRatePA ? 'complete' : 'missing',
      },
      {
        label: 'Coupon Frequency',
        value: params?.couponFreqPerYear === 12 ? 'Monthly' : params?.couponFreqPerYear === 4 ? 'Quarterly' : params?.couponFreqPerYear === 2 ? 'Semi-Annual' : params?.couponFreqPerYear === 1 ? 'Annual' : undefined,
        required: false,
        status: params?.couponFreqPerYear ? 'complete' : 'pending',
      }
    );
  } else if (draft.productType === 'CPPN') {
    fields.push(
      {
        label: 'Capital Protection',
        value: params?.capitalProtectionPct !== undefined ? `${params.capitalProtectionPct}%` : undefined,
        required: true,
        status: params?.capitalProtectionPct !== undefined ? 'complete' : 'missing',
      },
      {
        label: 'Participation Rate',
        value: params?.participationRatePct ? `${params.participationRatePct}%` : undefined,
        required: true,
        status: params?.participationRatePct ? 'complete' : 'missing',
      },
      {
        label: 'Participation Start',
        value: params?.participationStartPct ? `${params.participationStartPct}%` : undefined,
        required: true,
        status: params?.participationStartPct ? 'complete' : 'missing',
      }
    );
  } else if (draft.productType === 'Bonus') {
    fields.push(
      {
        label: 'Bonus Level',
        value: params?.bonusLevelPct ? `${params.bonusLevelPct}%` : undefined,
        required: true,
        status: params?.bonusLevelPct ? 'complete' : 'missing',
      },
      {
        label: 'Bonus Barrier',
        value: params?.bonusBarrierPct ? `${params.bonusBarrierPct}%` : undefined,
        required: true,
        status: params?.bonusBarrierPct ? 'complete' : 'missing',
      }
    );
  }

  const canGenerate = completeness >= 80;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Live Preview</h3>
              <p className="text-xs text-slate-500">Report building in real-time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fields List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.label}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              field.status === 'complete'
                ? 'border-emerald-200 bg-emerald-50'
                : field.status === 'pending'
                  ? 'border-slate-200 bg-slate-50'
                  : 'border-dashed border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {field.status === 'complete' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : field.status === 'pending' ? (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300" />
                  )}
                  <span className={`text-sm font-semibold ${
                    field.status === 'complete' ? 'text-emerald-700' : 'text-slate-600'
                  }`}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </div>
                <div className={`text-sm ml-6 ${
                  field.value ? 'text-slate-800 font-medium' : 'text-slate-400 italic'
                }`}>
                  {field.value || 'AI is asking...'}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Missing Fields Alert */}
        {draft.missingFields.length > 0 && completeness < 80 && (
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  Still needed:
                </p>
                <p className="text-sm text-amber-700">
                  {draft.missingFields.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ready to Generate */}
        {canGenerate && (
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-900">
                  Ready to Generate! 🎉
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  All required fields are complete
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Report & PDF...
            </span>
          ) : canGenerate ? (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Report & PDF
            </span>
          ) : (
            <span>Complete {100 - completeness}% More</span>
          )}
        </button>

        {canGenerate && !isGenerating && (
          <p className="text-xs text-center text-slate-500 mt-2">
            This will create a full report with PDF export
          </p>
        )}
      </div>
    </div>
  );
}

