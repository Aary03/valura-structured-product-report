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
        <div 
          className="flex items-center space-x-2 px-5 py-2.5 rounded-full border text-white"
          style={{
            background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%)',
            borderColor: 'var(--primary-blue)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-semibold">
            Pricing: {formatDate(pricingDate, 'short')}
          </span>
        </div>

        {/* Coupon Dates */}
        {nextCoupons.map((date, index) => (
          <div 
            key={date} 
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full border hover:shadow-medium transition-all"
            style={{
              backgroundColor: 'var(--accent-teal-bg)',
              borderColor: 'var(--accent-teal)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <Clock className="w-4 h-4 text-accent-teal-dark" />
            <span className="text-sm font-semibold text-accent-teal-dark">
              Coupon {index + 1}: {formatDate(date, 'short')}
            </span>
          </div>
        ))}

        {/* Maturity Date */}
        <div 
          className="flex items-center space-x-2 px-5 py-2.5 rounded-full border"
          style={{
            backgroundColor: 'var(--accent-coral-bg)',
            borderColor: 'var(--accent-coral)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <Calendar className="w-4 h-4 text-accent-coral-dark" />
          <span className="text-sm font-semibold text-accent-coral-dark">
            Maturity: {formatDate(maturityDate, 'short')}
          </span>
        </div>
      </div>
    </div>
  );
}

