/**
 * Key Dates Component
 * Horizontal strip showing pricing date, coupon dates, and maturity
 */

import type { ISODateString } from '../../core/types/dates';
import { formatDate } from '../../core/types/dates';
import { Calendar, Clock } from 'lucide-react';

interface KeyDatesProps {
  pricingDate: ISODateString;
  couponSchedule: ISODateString[];
  maturityDate: ISODateString;
}

export function KeyDates({ pricingDate, couponSchedule, maturityDate }: KeyDatesProps) {
  // Show next 4 coupon dates (or all if less than 4)
  const nextCoupons = couponSchedule.slice(0, 4);
  
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {/* Pricing Date */}
        <div className="flex items-center space-x-2 px-4 py-2 bg-valura-ink rounded-full border border-valura-ink">
          <Calendar className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">
            Pricing: {formatDate(pricingDate, 'short')}
          </span>
        </div>

        {/* Coupon Dates */}
        {nextCoupons.map((date, index) => (
          <div 
            key={date} 
            className="flex items-center space-x-2 px-4 py-2 bg-surface-2 rounded-full border border-border"
          >
            <Clock className="w-4 h-4 text-valura-ink" />
            <span className="text-sm font-medium text-valura-ink">
              Coupon {index + 1}: {formatDate(date, 'short')}
            </span>
          </div>
        ))}

        {/* Maturity Date */}
        <div className="flex items-center space-x-2 px-4 py-2 bg-valura-mint rounded-full border border-valura-mint">
          <Calendar className="w-4 h-4 text-valura-ink" />
          <span className="text-sm font-medium text-valura-ink">
            Maturity: {formatDate(maturityDate, 'short')}
          </span>
        </div>
      </div>
    </div>
  );
}

