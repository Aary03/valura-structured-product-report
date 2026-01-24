/**
 * Cashflows Table Component
 * Shows coupon schedule for Regular Income, maturity-only for others
 */

import type { ProductLifecycleData, CouponSchedule } from '../../types/lifecycle';
import { CheckCircle2, Clock, Circle, DollarSign } from 'lucide-react';
import { formatNumber } from '../../core/utils/math';

interface CashflowsTableProps {
  data: ProductLifecycleData;
  couponSchedule?: CouponSchedule[];
  notional?: number;
}

export function CashflowsTable({ data, couponSchedule = [], notional = 100000 }: CashflowsTableProps) {
  const { bucket, regularIncomeTerms } = data;
  
  // If not Regular Income or no coupons, show simple maturity payout message
  if (bucket !== 'REGULAR_INCOME' || !regularIncomeTerms || couponSchedule.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-bold text-base text-text-primary mb-4 uppercase tracking-wide">
          Cashflows
        </h3>
        <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200">
          <div className="p-3 rounded-lg bg-blue-100">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-base text-text-primary mb-1">
              Maturity Payout Only
            </div>
            <div className="text-sm text-text-secondary leading-relaxed">
              {bucket === 'CAPITAL_PROTECTION' && 
                'Return paid at maturity based on final underlying performance and participation terms'}
              {bucket === 'BOOSTED_GROWTH' && 
                'Bonus or final performance-based return paid at maturity'}
            </div>
            <div className="mt-3 text-sm text-text-tertiary">
              Maturity date: {new Date(data.maturityDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular Income: show coupon schedule
  const totalCoupons = couponSchedule.filter(c => c.status === 'paid').length;
  const upcomingCoupons = couponSchedule.filter(c => c.status === 'upcoming' || c.status === 'pending').length;
  const totalCouponAmount = couponSchedule.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
  
  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-bold text-base text-text-primary uppercase tracking-wide">
          Coupon Schedule
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-text-secondary">
              <span className="font-bold text-green-700">{totalCoupons}</span> paid
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-text-secondary">
              <span className="font-bold text-amber-700">{upcomingCoupons}</span> upcoming
            </span>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold text-sm">
            ${formatNumber(totalCouponAmount, 2)} received
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                #
              </th>
              <th className="text-left py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                Observation Date
              </th>
              <th className="text-left py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                Payment Date
              </th>
              <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                Coupon Rate
              </th>
              <th className="text-right py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                Amount
              </th>
              {regularIncomeTerms.conditionalCoupon && (
                <th className="text-center py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                  Barrier Check
                </th>
              )}
              <th className="text-center py-3 px-3 font-bold text-xs uppercase tracking-wide text-text-secondary">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {couponSchedule.map((coupon, idx) => {
              const isPaid = coupon.status === 'paid';
              const isUpcoming = coupon.status === 'upcoming';
              const barrierOk = !regularIncomeTerms.conditionalCoupon || !coupon.barrierChecked || !coupon.barrierBreached;
              
              return (
                <tr 
                  key={idx} 
                  className={`border-b border-border transition-colors ${
                    isUpcoming ? 'bg-purple-50' : isPaid ? 'bg-green-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-text-primary">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-3 text-text-secondary">
                    {new Date(coupon.observationDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-3 text-text-secondary">
                    {new Date(coupon.paymentDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="text-right py-3 px-3 font-bold text-blue-700">
                    {coupon.couponRate.toFixed(2)}%
                  </td>
                  <td className="text-right py-3 px-3 font-mono font-semibold text-text-primary">
                    ${formatNumber(coupon.amount, 2)}
                  </td>
                  {regularIncomeTerms.conditionalCoupon && (
                    <td className="text-center py-3 px-3">
                      {coupon.barrierChecked ? (
                        barrierOk ? (
                          <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Pass</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                            <Circle className="w-4 h-4" />
                            <span>Breach</span>
                          </span>
                        )
                      ) : (
                        <span className="text-text-tertiary text-xs">Pending</span>
                      )}
                    </td>
                  )}
                  <td className="text-center py-3 px-3">
                    {isPaid && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Paid
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        Upcoming
                      </span>
                    )}
                    {coupon.status === 'pending' && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Summary footer */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
        <div className="text-text-secondary">
          <span className="font-semibold">Coupon Rate:</span> {regularIncomeTerms.couponRatePct.toFixed(2)}% p.a. 
          {regularIncomeTerms.conditionalCoupon && (
            <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
              Conditional
            </span>
          )}
        </div>
        <div className="font-bold text-text-primary">
          Total Received: <span className="text-green-700">${formatNumber(totalCouponAmount, 2)}</span>
        </div>
      </div>
    </div>
  );
}
