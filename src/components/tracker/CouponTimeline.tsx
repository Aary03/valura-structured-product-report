/**
 * Coupon Timeline Component
 * Visual timeline of coupon payments (past and future)
 */

import { CheckCircle, Circle, Calendar } from 'lucide-react';
import type { CouponPayment } from '../../types/investment';
import { formatCurrency } from '../../services/positionValuation';

interface CouponTimelineProps {
  coupons: CouponPayment[];
  currency: string;
}

export function CouponTimeline({ coupons, currency }: CouponTimelineProps) {
  if (coupons.length === 0) {
    return null;
  }

  const today = new Date();
  const paidCoupons = coupons.filter(c => c.paid);
  const unpaidCoupons = coupons.filter(c => !c.paid);
  const totalReceived = paidCoupons.reduce((sum, c) => sum + c.amount, 0);
  const totalExpected = unpaidCoupons.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-positive/10 rounded-lg">
            <Calendar className="w-5 h-5 text-green-positive" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted">Coupon Payments</h3>
            <p className="text-lg font-semibold text-valura-ink">
              {paidCoupons.length} of {coupons.length} Received
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-muted">Total Received</div>
          <div className="text-lg font-bold text-green-positive">
            {formatCurrency(totalReceived, currency)}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-positive/5 border border-green-positive/20 rounded-lg p-3">
          <div className="text-sm text-muted mb-1">Received</div>
          <div className="text-xl font-bold text-green-positive">
            {formatCurrency(totalReceived, currency)}
          </div>
          <div className="text-xs text-muted mt-1">{paidCoupons.length} payments</div>
        </div>
        
        <div className="bg-blue-primary/5 border border-blue-primary/20 rounded-lg p-3">
          <div className="text-sm text-muted mb-1">Expected</div>
          <div className="text-xl font-bold text-blue-primary">
            {formatCurrency(totalExpected, currency)}
          </div>
          <div className="text-xs text-muted mt-1">{unpaidCoupons.length} upcoming</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-muted uppercase tracking-wide">
          Payment Timeline
        </div>
        
        <div className="space-y-2">
          {coupons.map((coupon, index) => {
            const couponDate = new Date(coupon.date);
            const isPast = couponDate < today || coupon.paid;
            const isToday = couponDate.toDateString() === today.toDateString();
            
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isPast 
                    ? 'bg-green-positive/5 border-green-positive/20' 
                    : 'bg-grey-light border-border'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {coupon.paid ? (
                    <CheckCircle className="w-5 h-5 text-green-positive" />
                  ) : (
                    <Circle className="w-5 h-5 text-grey-medium" />
                  )}
                </div>

                {/* Date and Description */}
                <div className="flex-1">
                  <div className="font-medium text-valura-ink">
                    {formatDate(coupon.date)}
                    {isToday && (
                      <span className="ml-2 text-xs bg-blue-primary text-white px-2 py-0.5 rounded">
                        TODAY
                      </span>
                    )}
                  </div>
                  {coupon.description && (
                    <div className="text-sm text-muted">{coupon.description}</div>
                  )}
                </div>

                {/* Amount */}
                <div className="text-right">
                  <div className={`font-semibold ${
                    coupon.paid ? 'text-green-positive' : 'text-muted'
                  }`}>
                    {formatCurrency(coupon.amount, currency)}
                  </div>
                  <div className="text-xs text-muted">
                    {coupon.paid ? 'Paid' : 'Expected'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
