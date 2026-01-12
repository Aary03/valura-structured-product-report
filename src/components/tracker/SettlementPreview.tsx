/**
 * Settlement Preview Component
 * Shows projected settlement at maturity (cash or shares)
 */

import { CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import type { PositionValue } from '../../types/investment';
import { formatCurrency } from '../../services/positionValuation';

interface SettlementPreviewProps {
  value: PositionValue;
  currency: string;
  worstTicker?: string;
}

export function SettlementPreview({ value, currency, worstTicker }: SettlementPreviewProps) {
  const isCash = value.settlementType === 'cash';

  return (
    <div className="section-card">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${
          isCash ? 'bg-green-positive/10' : 'bg-yellow-500/10'
        }`}>
          {isCash ? (
            <CheckCircle className="w-5 h-5 text-green-positive" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted">At Maturity</h3>
          <p className="text-lg font-semibold text-valura-ink">
            {value.daysToMaturity === 0 ? 'Today' : `in ${value.daysToMaturity} days`}
          </p>
        </div>
      </div>

      {isCash ? (
        <CashSettlement value={value} currency={currency} />
      ) : (
        <SharesSettlement value={value} currency={currency} worstTicker={worstTicker} />
      )}
    </div>
  );
}

function CashSettlement({ value, currency }: { value: PositionValue; currency: string }) {
  const totalValue = value.cashAmount! + value.couponsReceivedToDate;

  return (
    <div className="space-y-4">
      <div className="bg-green-positive/5 border border-green-positive/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-positive" />
          <h4 className="font-semibold text-valura-ink">Cash Redemption Expected</h4>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted text-sm">Principal Redemption</span>
            <span className="font-semibold text-valura-ink">
              {formatCurrency(value.cashAmount!, currency)}
            </span>
          </div>
          
          {value.couponsReceivedToDate > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Total Coupons Received</span>
              <span className="font-semibold text-green-positive">
                + {formatCurrency(value.couponsReceivedToDate, currency)}
              </span>
            </div>
          )}
          
          <div className="pt-3 border-t border-green-positive/20 flex justify-between items-center">
            <span className="font-semibold text-valura-ink">Total You Receive</span>
            <span className="text-xl font-bold text-green-positive">
              {formatCurrency(totalValue, currency)}
            </span>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted">
        ✓ Your principal will be returned in full as cash at maturity
      </div>
    </div>
  );
}

function SharesSettlement({ 
  value, 
  currency, 
  worstTicker 
}: { 
  value: PositionValue; 
  currency: string; 
  worstTicker?: string;
}) {
  const ticker = worstTicker || value.worstPerformer?.ticker || 'underlying';
  const hasPositiveValue = value.sharesMarketValue! > value.initialInvestment;

  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h4 className="font-semibold text-valura-ink">Physical Share Delivery</h4>
        </div>
        
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 border border-border">
            <div className="text-sm text-muted mb-1">You will receive</div>
            <div className="text-2xl font-bold text-valura-ink">
              {value.sharesReceived?.toLocaleString()} shares
            </div>
            <div className="text-sm font-medium text-muted mt-1">of {ticker}</div>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-muted text-sm">Current Market Value</span>
            <div className="text-right">
              <div className={`font-semibold ${
                hasPositiveValue ? 'text-green-positive' : 'text-red-negative'
              }`}>
                {formatCurrency(value.sharesMarketValue!, currency)}
              </div>
              {value.worstPerformer && (
                <div className="text-xs text-muted">
                  @ {formatCurrency(value.worstPerformer.currentPrice, currency)}/share
                </div>
              )}
            </div>
          </div>

          {value.couponsReceivedToDate > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-muted text-sm">Plus: Coupons Received</span>
              <span className="font-semibold text-green-positive">
                + {formatCurrency(value.couponsReceivedToDate, currency)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-primary/5 border border-blue-primary/20 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-blue-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted">
            <strong className="text-valura-ink">Note:</strong> You'll receive physical shares instead of cash. 
            You can hold them for potential recovery or sell at market price.
          </div>
        </div>
      </div>
    </div>
  );
}
