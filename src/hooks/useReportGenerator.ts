/**
 * useReportGenerator Hook
 * Main hook that orchestrates form data → terms → calculations → API data → report data
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ReverseConvertibleTerms } from '../products/reverseConvertible/terms';
import type { Underlying } from '../products/common/productTypes';
import { useUnderlyingData } from './useUnderlyingData';
import { usePayoffCalculation } from './usePayoffCalculation';
import type { UnderlyingData } from '../services/api/mappers';
import { calculateBarrierPrice, calculateDistanceToBarrier } from '../services/referencePrice';
import { calculateTotalCouponsPct, calculateBreakEvenPct } from '../products/reverseConvertible/breakEven';
import { generateCouponSchedule } from '../products/common/schedule';
import { getCurrentISODate } from '../core/types/dates';
import type { ISODateString } from '../core/types/dates';

export interface ReportData {
  terms: ReverseConvertibleTerms;
  underlyingData: UnderlyingData[];
  historicalData: any[][];
  payoffResult: any;
  curvePoints: any[];
  intrinsicValue: number | null;
  barrierLevel: number;
  strikeLevel: number | undefined;
  worstOfLevel: number | null;
  worstUnderlyingIndex: number | null;
  documentId: string;
  generatedDate: string;
  // New fields for investor-first report
  referencePrices: number[]; // Reference price per underlying
  closestToBarrierIndex: number | null; // Index of underlying closest to barrier today
  totalCouponsPct: number; // Total coupon percentage over tenor
  breakEvenPct: number; // Break-even worst-of final level
  couponSchedule: ISODateString[]; // Coupon payment dates
}

interface UseReportGeneratorResult {
  reportData: ReportData | null;
  loading: boolean;
  error: string | null;
  generateReport: (terms: ReverseConvertibleTerms) => Promise<void>;
  clearReport: () => void;
}

/**
 * Generate unique document ID
 */
function generateDocumentId(): string {
  return `RC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Main report generator hook
 */
export function useReportGenerator(): UseReportGeneratorResult {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTerms, setCurrentTerms] = useState<ReverseConvertibleTerms | null>(null);

  // Get underlying array from terms (new structure uses underlyings array)
  const underlyings: Underlying[] = currentTerms?.underlyings || [];

  // Fetch underlying data
  const {
    data: underlyingData,
    historicalData,
    loading: dataLoading,
    error: dataError,
  } = useUnderlyingData(underlyings, currentTerms !== null);

  // Get arrays of prices for basket support
  const spotPrices: number[] = underlyingData.map(d => d.currentPrice);
  const initialFixings: number[] = underlyingData.map((d, i) => 
    d.initialFixing ?? d.currentPrice ?? (currentTerms?.initialFixings?.[i] || 100)
  );

  // Calculate payoff (supports basket)
  const {
    payoffResult,
    curvePoints,
    intrinsicValue,
    barrierLevel,
    strikeLevel,
    worstOfLevel,
    worstUnderlyingIndex,
  } = usePayoffCalculation(currentTerms, spotPrices, initialFixings);

  const generateReport = useCallback(async (terms: ReverseConvertibleTerms) => {
    setLoading(true);
    setError(null);
    setCurrentTerms(terms);
    // The hooks will automatically fetch when currentTerms changes
    // Report data will be set via useEffect when data is ready
  }, []);

  // Calculate additional report data
  const additionalData = useMemo(() => {
    if (!currentTerms || underlyingData.length === 0) {
      return null;
    }

    // Reference prices: default to current spot (today mode)
    const referencePrices = underlyingData.map(d => d.currentPrice);
    
    // Calculate closest to barrier
    const barrierPct = currentTerms.barrierPct || 0;
    let closestToBarrierIndex: number | null = null;
    let minDistance = Infinity;
    
    underlyingData.forEach((data, index) => {
      const referencePrice = referencePrices[index];
      const barrierPrice = calculateBarrierPrice(referencePrice, barrierPct);
      const distance = Math.abs(calculateDistanceToBarrier(data.currentPrice, barrierPrice));
      
      if (distance < minDistance) {
        minDistance = distance;
        closestToBarrierIndex = index;
      }
    });
    
    // Calculate total coupons and break-even
    const totalCouponsPct = calculateTotalCouponsPct(currentTerms);
    const breakEvenPct = calculateBreakEvenPct(currentTerms);
    
    // Generate coupon schedule
    const couponSchedule = generateCouponSchedule(
      getCurrentISODate(),
      currentTerms.tenorMonths,
      currentTerms.couponFreqPerYear
    );
    
    return {
      referencePrices,
      closestToBarrierIndex,
      totalCouponsPct,
      breakEvenPct,
      couponSchedule,
    };
  }, [currentTerms, underlyingData]);

  // Update report data when underlying data changes
  useEffect(() => {
    if (currentTerms && underlyingData.length > 0 && payoffResult && !dataLoading && additionalData && !reportData) {
      const documentId = generateDocumentId();
      const generatedDate = new Date().toISOString().split('T')[0];

      const nextReport: ReportData = {
        terms: currentTerms,
        underlyingData,
        historicalData,
        payoffResult,
        curvePoints,
        intrinsicValue,
        barrierLevel,
        strikeLevel,
        worstOfLevel: worstOfLevel || null,
        worstUnderlyingIndex: worstUnderlyingIndex !== null ? worstUnderlyingIndex : null,
        documentId,
        generatedDate,
        ...additionalData,
      };

      setReportData(nextReport);
      // Persist for PDF route/server-side generation
      try {
        sessionStorage.setItem('valura:lastReport', JSON.stringify(nextReport));
      } catch {
        // ignore storage errors
      }
      setLoading(false);
    }
  }, [currentTerms, underlyingData, payoffResult, dataLoading, historicalData, curvePoints, intrinsicValue, barrierLevel, strikeLevel, additionalData, reportData]);

  // Handle data errors
  useEffect(() => {
    if (dataError) {
      setError(dataError);
      setLoading(false);
    }
  }, [dataError]);

  const clearReport = useCallback(() => {
    setReportData(null);
    setCurrentTerms(null);
    setError(null);
  }, []);

  return {
    reportData,
    loading: loading || dataLoading,
    error: error || dataError,
    generateReport,
    clearReport,
  };
}

