/**
 * useReportGenerator Hook
 * Main hook that orchestrates form data → terms → calculations → API data → report data
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ReverseConvertibleTerms } from '../products/reverseConvertible/terms';
import type { CapitalProtectedParticipationTerms } from '../products/capitalProtectedParticipation/terms';
import type { Underlying } from '../products/common/productTypes';
import { useUnderlyingData } from './useUnderlyingData';
import { usePayoffCalculation } from './usePayoffCalculation';
import type { UnderlyingData } from '../services/api/mappers';
import { calculateBarrierPrice, calculateDistanceToBarrier } from '../services/referencePrice';
import { calculateTotalCouponsPct, calculateBreakEvenPct } from '../products/reverseConvertible/breakEven';
import { calculateCppnBreakevenLevelPct } from '../products/capitalProtectedParticipation/breakEven';
import { generateCouponSchedule } from '../products/common/schedule';
import { getCurrentISODate } from '../core/types/dates';
import type { ISODateString } from '../core/types/dates';

export type ProductTerms = ReverseConvertibleTerms | CapitalProtectedParticipationTerms;

interface BaseReportData {
  productType: 'RC' | 'CPPN';
  underlyingData: UnderlyingData[];
  historicalData: any[][];
  payoffResult: any;
  curvePoints: any[];
  intrinsicValue: number | null;
  documentId: string;
  generatedDate: string;
  referencePrices: number[]; // Reference price per underlying
}

export interface ReverseConvertibleReportData extends BaseReportData {
  productType: 'RC';
  terms: ReverseConvertibleTerms;
  barrierLevel: number;
  strikeLevel: number | undefined;
  worstOfLevel: number | null;
  worstUnderlyingIndex: number | null;
  closestToBarrierIndex: number | null;
  totalCouponsPct: number;
  breakEvenPct: number;
  couponSchedule: ISODateString[];
}

export interface CapitalProtectedParticipationReportData extends BaseReportData {
  productType: 'CPPN';
  terms: CapitalProtectedParticipationTerms;
  basketLevelPct: number | null; // X (%)
  knockInTriggered: boolean | null;
  breakeven: ReturnType<typeof calculateCppnBreakevenLevelPct> | null;
}

export type ReportData = ReverseConvertibleReportData | CapitalProtectedParticipationReportData;

interface UseReportGeneratorResult {
  reportData: ReportData | null;
  loading: boolean;
  error: string | null;
  generateReport: (terms: ProductTerms) => Promise<void>;
  clearReport: () => void;
}

/**
 * Generate unique document ID
 */
function generateDocumentId(prefix: 'RC' | 'CPPN'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Main report generator hook
 */
export function useReportGenerator(): UseReportGeneratorResult {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTerms, setCurrentTerms] = useState<ProductTerms | null>(null);

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
    basketLevelPct,
    knockInTriggered,
  } = usePayoffCalculation(currentTerms, spotPrices, initialFixings);

  const generateReport = useCallback(async (terms: ProductTerms) => {
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

    if (currentTerms.productType === 'RC') {
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
        productType: 'RC' as const,
        referencePrices,
        closestToBarrierIndex,
        totalCouponsPct,
        breakEvenPct,
        couponSchedule,
      };
    }

    const breakeven = calculateCppnBreakevenLevelPct(currentTerms);
    return {
      productType: 'CPPN' as const,
      referencePrices,
      breakeven,
    };
  }, [currentTerms, underlyingData]);

  // Update report data when underlying data changes
  useEffect(() => {
    if (currentTerms && underlyingData.length > 0 && payoffResult && !dataLoading && additionalData && !reportData) {
      const documentId = generateDocumentId(currentTerms.productType);
      const generatedDate = new Date().toISOString().split('T')[0];

      const base = {
        underlyingData,
        historicalData,
        payoffResult,
        curvePoints,
        intrinsicValue,
        documentId,
        generatedDate,
        referencePrices: additionalData.referencePrices,
      };

      const nextReport: ReportData =
        currentTerms.productType === 'RC'
          ? ({
              productType: 'RC',
              terms: currentTerms,
              barrierLevel,
              strikeLevel,
              worstOfLevel: worstOfLevel || null,
              worstUnderlyingIndex: worstUnderlyingIndex !== null ? worstUnderlyingIndex : null,
              closestToBarrierIndex: additionalData.closestToBarrierIndex,
              totalCouponsPct: additionalData.totalCouponsPct,
              breakEvenPct: additionalData.breakEvenPct,
              couponSchedule: additionalData.couponSchedule,
              ...base,
            } as ReverseConvertibleReportData)
          : ({
              productType: 'CPPN',
              terms: currentTerms,
              basketLevelPct: basketLevelPct ?? null,
              knockInTriggered: knockInTriggered ?? null,
              breakeven: additionalData.breakeven ?? null,
              ...base,
            } as CapitalProtectedParticipationReportData);

      setReportData(nextReport);
      // Persist for PDF route/server-side generation
      try {
        sessionStorage.setItem('valura:lastReport', JSON.stringify(nextReport));
      } catch {
        // ignore storage errors
      }
      setLoading(false);
    }
  }, [currentTerms, underlyingData, payoffResult, dataLoading, historicalData, curvePoints, intrinsicValue, barrierLevel, strikeLevel, worstOfLevel, worstUnderlyingIndex, basketLevelPct, knockInTriggered, additionalData, reportData]);

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

