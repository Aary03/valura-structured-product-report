/**
 * Underlyings Table Component
 * Conditional columns based on product bucket type
 */

import { useState } from 'react';
import type { ProductLifecycleData, UnderlyingLifecycle } from '../../types/lifecycle';
import { calculateDistanceMetrics } from '../../types/lifecycle';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Edit3 } from 'lucide-react';
import { formatNumber, formatPercent } from '../../core/utils/math';

interface UnderlyingsTableProps {
  data: ProductLifecycleData;
  isScenarioMode?: boolean;
  onInitialPriceChange?: (underlyingIndex: number, newPrice: number) => void;
}

export function UnderlyingsTable({ 
  data, 
  isScenarioMode = false,
  onInitialPriceChange,
}: UnderlyingsTableProps) {
  const { bucket, underlyings, worstPerformerIndex, bestPerformerIndex } = data;
  
  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <h3 className="font-bold text-base text-text-primary mb-4 uppercase tracking-wide">
        Underlying Assets
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                Underlying
              </th>
              <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                Initial
              </th>
              <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                Current
              </th>
              <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                Performance
              </th>
              
              {/* Conditional columns by bucket */}
              {bucket === 'REGULAR_INCOME' && (
                <>
                  <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                    Autocall Trigger
                  </th>
                  <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                    Distance to Autocall
                  </th>
                  <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                    Protection Level
                  </th>
                  <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                    Buffer to Protection
                  </th>
                </>
              )}
              
              {bucket === 'CAPITAL_PROTECTION' && (
                <>
                  <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                    Participation Start
                  </th>
                  <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                    Room to Start
                  </th>
                  <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                    Participation Rate
                  </th>
                  {data.capitalProtectionTerms?.capLevelPct && (
                    <>
                      <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                        Cap Level
                      </th>
                      <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                        Room to Cap
                      </th>
                    </>
                  )}
                </>
              )}
              
              {bucket === 'BOOSTED_GROWTH' && (
                <>
                  <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                    Barrier
                  </th>
                  <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                    Buffer to Barrier
                  </th>
                  <th className="text-center py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                    Barrier Status
                  </th>
                  <th className="text-center py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                    Bonus Eligible
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {underlyings.map((underlying, idx) => {
              const isWorst = worstPerformerIndex === idx;
              const isBest = bestPerformerIndex === idx;
              const perfColor = underlying.performancePct >= 0 ? 'text-success-fg' : 'text-danger-fg';
              const perfIcon = underlying.performancePct > 0 ? TrendingUp : underlying.performancePct < 0 ? TrendingDown : Minus;
              const PerfIcon = perfIcon;
              
              return (
                <tr 
                  key={underlying.symbol} 
                  className={`border-b border-border hover:bg-surface-2 transition-colors ${
                    isWorst ? 'bg-red-50' : isBest ? 'bg-green-50' : ''
                  }`}
                >
                  {/* Underlying */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary">{underlying.symbol}</span>
                      {isWorst && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          Worst
                        </span>
                      )}
                      {isBest && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Best
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-tertiary mt-0.5">
                      {underlying.name}
                    </div>
                  </td>
                  
                  {/* Initial */}
                  <td className="text-right py-3 px-3">
                    <EditablePriceCell
                      value={underlying.initialPrice}
                      isEditable={isScenarioMode}
                      onChange={(newPrice) => onInitialPriceChange?.(idx, newPrice)}
                    />
                  </td>
                  
                  {/* Current */}
                  <td className="text-right py-3 px-3 font-mono font-semibold text-text-primary">
                    ${formatNumber(underlying.currentPrice, 2)}
                  </td>
                  
                  {/* Performance */}
                  <td className="text-right py-3 px-3">
                    <div className={`flex items-center justify-end gap-1.5 font-bold ${perfColor}`}>
                      <PerfIcon className="w-4 h-4" />
                      <span>{formatPercent(underlying.performancePct)}</span>
                    </div>
                  </td>
                  
                  {/* REGULAR INCOME columns */}
                  {bucket === 'REGULAR_INCOME' && (
                    <>
                      {/* Autocall Trigger */}
                      <td className="text-right py-3 px-3">
                        {underlying.autocallLevel && underlying.autocallLevelPct ? (
                          <div>
                            <div className="font-mono text-text-secondary">
                              ${formatNumber(underlying.autocallLevel, 2)}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              ({formatPercent(underlying.autocallLevelPct)})
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </td>
                      
                      {/* Distance to Autocall */}
                      <td className="text-right py-3 px-3">
                        {underlying.autocallLevel ? (
                          <DistanceCell
                            currentPrice={underlying.currentPrice}
                            targetPrice={underlying.autocallLevel}
                            type="to_target"
                          />
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </td>
                      
                      {/* Protection Level */}
                      <td className="text-right py-3 px-3">
                        {underlying.protectionLevel && underlying.protectionLevelPct ? (
                          <div>
                            <div className="font-mono text-text-secondary">
                              ${formatNumber(underlying.protectionLevel, 2)}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              ({formatPercent(underlying.protectionLevelPct)})
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </td>
                      
                      {/* Buffer to Protection */}
                      <td className="text-right py-3 px-3">
                        {underlying.protectionLevel ? (
                          <DistanceCell
                            currentPrice={underlying.currentPrice}
                            targetPrice={underlying.protectionLevel}
                            type="buffer_from_target"
                          />
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </td>
                    </>
                  )}
                  
                  {/* CAPITAL PROTECTION columns */}
                  {bucket === 'CAPITAL_PROTECTION' && (
                    <>
                      {/* Participation Start */}
                      <td className="text-right py-3 px-3">
                        {underlying.participationStart && underlying.participationStartPct ? (
                          <div>
                            <div className="font-mono text-text-secondary">
                              ${formatNumber(underlying.participationStart, 2)}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              ({formatPercent(underlying.participationStartPct)})
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </td>
                      
                      {/* Room to Start */}
                      <td className="text-right py-3 px-3">
                        {underlying.participationStart ? (
                          <DistanceCell
                            currentPrice={underlying.currentPrice}
                            targetPrice={underlying.participationStart}
                            type="to_target"
                          />
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </td>
                      
                      {/* Participation Rate */}
                      <td className="text-right py-3 px-3 font-semibold text-green-700">
                        {data.capitalProtectionTerms?.participationRatePct}%
                      </td>
                      
                      {/* Cap Level (if exists) */}
                      {data.capitalProtectionTerms?.capLevelPct && (
                        <>
                          <td className="text-right py-3 px-3">
                            {underlying.capLevel && underlying.capLevelPct ? (
                              <div>
                                <div className="font-mono text-text-secondary">
                                  ${formatNumber(underlying.capLevel, 2)}
                                </div>
                                <div className="text-xs text-text-tertiary">
                                  ({formatPercent(underlying.capLevelPct)})
                                </div>
                              </div>
                            ) : (
                              <span className="text-text-tertiary">—</span>
                            )}
                          </td>
                          
                          <td className="text-right py-3 px-3">
                            {underlying.capLevel ? (
                              <DistanceCell
                                currentPrice={underlying.currentPrice}
                                targetPrice={underlying.capLevel}
                                type="to_target"
                              />
                            ) : (
                              <span className="text-text-tertiary">—</span>
                            )}
                          </td>
                        </>
                      )}
                    </>
                  )}
                  
                  {/* BOOSTED GROWTH columns */}
                  {bucket === 'BOOSTED_GROWTH' && (
                    <>
                      {/* Barrier */}
                      <td className="text-right py-3 px-3">
                        {underlying.barrierLevel && underlying.barrierLevelPct ? (
                          <div>
                            <div className="font-mono text-text-secondary">
                              ${formatNumber(underlying.barrierLevel, 2)}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              ({formatPercent(underlying.barrierLevelPct)})
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </td>
                      
                      {/* Buffer to Barrier */}
                      <td className="text-right py-3 px-3">
                        {underlying.barrierLevel ? (
                          <DistanceCell
                            currentPrice={underlying.currentPrice}
                            targetPrice={underlying.barrierLevel}
                            type="buffer_from_target"
                          />
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )}
                      </td>
                      
                      {/* Barrier Status */}
                      <td className="text-center py-3 px-3">
                        {underlying.barrierBreached ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5 text-red-600 font-semibold">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Breached</span>
                            </div>
                            {underlying.barrierBreachedDate && (
                              <div className="text-xs text-text-tertiary">
                                {new Date(underlying.barrierBreachedDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 text-green-600 font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            <span>Safe</span>
                          </div>
                        )}
                      </td>
                      
                      {/* Bonus Eligible */}
                      <td className="text-center py-3 px-3">
                        {underlying.barrierBreached ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            No
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            Yes ✓
                          </span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Legend for worst/best performer */}
      {(worstPerformerIndex !== undefined || bestPerformerIndex !== undefined) && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            {worstPerformerIndex !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  Worst
                </span>
                <span>Drives outcome for worst-of basket</span>
              </div>
            )}
            {bestPerformerIndex !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Best
                </span>
                <span>Drives outcome for best-of basket</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function EditablePriceCell({
  value,
  isEditable,
  onChange,
}: {
  value: number;
  isEditable: boolean;
  onChange: (newValue: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  
  const handleBlur = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed > 0) {
      onChange(parsed);
    } else {
      setInputValue(value.toString());
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
      setIsEditing(false);
    }
  };
  
  if (!isEditable) {
    return (
      <span className="font-mono text-text-secondary">
        ${formatNumber(value, 2)}
      </span>
    );
  }
  
  if (isEditing) {
    return (
      <input
        type="number"
        step="0.01"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-24 px-2 py-1 text-right font-mono text-sm border-2 border-amber-500 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
    );
  }
  
  return (
    <button
      onClick={() => {
        setIsEditing(true);
        setInputValue(value.toString());
      }}
      className="group flex items-center justify-end gap-2 w-full hover:bg-amber-50 px-2 py-1 rounded transition-colors"
    >
      <Edit3 className="w-3 h-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="font-mono text-text-secondary group-hover:text-amber-700 font-semibold">
        ${formatNumber(value, 2)}
      </span>
    </button>
  );
}

function DistanceCell({ 
  currentPrice, 
  targetPrice, 
  type 
}: { 
  currentPrice: number; 
  targetPrice: number; 
  type: 'to_target' | 'buffer_from_target';
}) {
  const metrics = calculateDistanceMetrics(currentPrice, targetPrice, type);
  
  const color = metrics.isPositive ? 'text-green-600' : 'text-amber-600';
  const bgColor = metrics.isPositive ? 'bg-green-50' : 'bg-amber-50';
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${bgColor}`}>
      <span className={`text-xs font-bold ${color}`}>
        {metrics.label}
      </span>
    </div>
  );
}
