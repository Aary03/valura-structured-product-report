/**
 * Unified Settlement Preview Component
 * Standardized cash/physical tabs across all product types
 */

import { useState } from 'react';
import { DollarSign, TrendingUp, Info } from 'lucide-react';
import type { PositionSnapshot } from '../../services/positionEvaluator';
import { formatSnapshotCurrency } from '../../services/positionEvaluator';

interface UnifiedSettlementPreviewProps {
  snapshot: PositionSnapshot;
  currency: string;
}

export function UnifiedSettlementPreview({ snapshot, currency }: UnifiedSettlementPreviewProps) {
  const [activeTab, setActiveTab] = useState<'cash' | 'physical'>(
    snapshot.settlement.type
  );

  const isCashSettlement = snapshot.settlement.type === 'cash';
  const hasPhysicalOption = snapshot.settlement.shares && snapshot.settlement.shares.length > 0;

  return (
    <div className="section-card">
      <h3 className="text-lg font-bold text-valura-ink mb-4">Settlement Preview</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('cash')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'cash'
              ? 'text-green-600'
              : 'text-muted hover:text-valura-ink'
          } ${!isCashSettlement && !hasPhysicalOption ? 'opacity-50' : ''}`}
        >
          💵 Cash Equivalent
          {activeTab === 'cash' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('physical')}
          disabled={!hasPhysicalOption}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'physical'
              ? 'text-orange-600'
              : 'text-muted hover:text-valura-ink'
          } ${!hasPhysicalOption ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          📊 Physical Delivery
          {activeTab === 'physical' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-t" />
          )}
        </button>
      </div>

      {/* Cash Tab */}
      {activeTab === 'cash' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-400 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h4 className="text-lg font-bold text-green-700">
                {isCashSettlement ? 'Expected Settlement' : 'Cash Equivalent Value'}
              </h4>
            </div>

            <div className="space-y-3">
              {snapshot.settlement.cashAmount && (
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                  <span className="text-sm text-muted">Principal Redemption</span>
                  <span className="text-2xl font-bold text-valura-ink">
                    {formatSnapshotCurrency(snapshot.settlement.cashAmount, currency)}
                  </span>
                </div>
              )}

              {snapshot.couponsReceived > 0 && (
                <div className="flex justify-between items-center p-3 bg-green-100/80 rounded-lg border border-green-300">
                  <span className="text-sm text-muted">+ Coupons Received</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatSnapshotCurrency(snapshot.couponsReceived, currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <span className="font-bold text-white">Total Cash Settlement</span>
                <span className="text-3xl font-black text-white">
                  {formatSnapshotCurrency(snapshot.indicativeOutcomeValue, currency)}
                </span>
              </div>
            </div>

            {isCashSettlement && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <div className="text-sm text-green-900">
                  ✓ Based on current levels, you would receive cash redemption at settlement.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Physical Tab */}
      {activeTab === 'physical' && (
        <div className="space-y-4">
          {hasPhysicalOption ? (
            <div className="bg-gradient-to-br from-orange-50 to-red-100 border-2 border-orange-400 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600 rotate-90" />
                <h4 className="text-lg font-bold text-orange-700">Physical Share Delivery</h4>
              </div>

              {snapshot.settlement.shares!.map((share, idx) => (
                <div key={idx} className="space-y-3 mb-4">
                  <div className="font-semibold text-valura-ink text-lg mb-2">
                    {share.symbol} Shares
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/60 rounded-lg">
                      <div className="text-xs text-muted mb-1">Shares Delivered</div>
                      <div className="text-2xl font-bold text-valura-ink">
                        {share.quantity.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-3 bg-white/60 rounded-lg">
                      <div className="text-xs text-muted mb-1">Current Price</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {formatSnapshotCurrency(share.currentPrice, currency)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-orange-600 rounded-lg">
                    <span className="font-bold text-white">Market Value of Shares</span>
                    <span className="text-3xl font-black text-white">
                      {formatSnapshotCurrency(share.marketValue, currency)}
                    </span>
                  </div>
                </div>
              ))}

              {snapshot.couponsReceived > 0 && (
                <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border border-green-300 mt-3">
                  <span className="text-sm text-muted">+ Coupons Already Received</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatSnapshotCurrency(snapshot.couponsReceived, currency)}
                  </span>
                </div>
              )}

              <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-orange-700 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-900">
                    <strong>Physical delivery:</strong> You will receive the shares listed above instead 
                    of cash. You can hold them or sell at current market prices. The market value shown 
                    reflects today's prices and may change.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-grey-light rounded-xl text-center">
              <div className="text-muted text-sm">
                Physical delivery not applicable at current levels.
                <br />
                Based on product rules, cash settlement is expected.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
