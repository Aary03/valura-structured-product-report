/**
 * Conversation Mode Selector
 * Beautiful UI for choosing AI personality
 */

import { Check } from 'lucide-react';
import { CONVERSATION_MODES, type ConversationMode } from '../../types/conversationMode';

interface ModeSelectorProps {
  selectedMode: ConversationMode;
  onModeChange: (mode: ConversationMode) => void;
  disabled?: boolean;
}

export function ModeSelector({ selectedMode, onModeChange, disabled }: ModeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <span>AI Personality</span>
        <span className="text-xs text-slate-500 font-normal">(Choose your style)</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(CONVERSATION_MODES) as ConversationMode[]).map((modeId) => {
          const mode = CONVERSATION_MODES[modeId];
          const isSelected = selectedMode === modeId;

          return (
            <button
              key={modeId}
              onClick={() => onModeChange(modeId)}
              disabled={disabled}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Content */}
              <div className="flex items-start gap-3">
                <span className="text-2xl">{mode.emoji}</span>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 mb-1">
                    {mode.name}
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {mode.description}
                  </div>
                </div>
              </div>

              {/* Tone Badge */}
              <div className={`mt-3 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                isSelected 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {mode.tone}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact mode badge for header display
 */
export function ModeHeaderBadge({ mode }: { mode: ConversationMode }) {
  const config = CONVERSATION_MODES[mode];
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-200">
      <span className="text-sm">{config.emoji}</span>
      <span className="text-xs font-semibold text-indigo-700">{config.name}</span>
    </div>
  );
}

