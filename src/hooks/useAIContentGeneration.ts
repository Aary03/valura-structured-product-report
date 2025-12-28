/**
 * Hook for background AI content generation with caching
 */

import { useState, useEffect, useRef } from 'react';
import { generateAllContent, type ReportData, type GeneratedContent, type GenerationOptions } from '../services/ai/aiContentGenerator';

interface UseAIContentGenerationResult {
  content: GeneratedContent | null;
  isGenerating: boolean;
  isReady: boolean;
  error: string | null;
  regenerate: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const contentCache = new Map<string, { content: GeneratedContent; timestamp: number }>();

/**
 * Generate cache key from report data
 */
function getCacheKey(reportData: ReportData): string {
  const terms = reportData.terms;
  return JSON.stringify({
    productType: terms.productType,
    notional: terms.notional,
    tenor: terms.tenorMonths,
    underlyings: reportData.underlyingData.map(u => u.symbol),
    // Add key product-specific fields
    ...(terms.productType === 'RC' ? {
      variant: terms.variant,
      barrier: terms.barrierPct || terms.strikePct,
      coupon: terms.couponRatePA,
    } : {
      protection: (terms as any).capitalProtectionPct,
      participation: (terms as any).participationRatePct,
      bonus: (terms as any).bonusEnabled,
    }),
  });
}

/**
 * Hook for automatic background content generation
 */
export function useAIContentGeneration(
  reportData: ReportData | null,
  options: GenerationOptions = {}
): UseAIContentGenerationResult {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const generate = async () => {
    if (!reportData) return;

    const cacheKey = getCacheKey(reportData);
    
    // Check cache first
    const cached = contentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setContent(cached.content);
      setIsReady(true);
      setIsGenerating(false);
      return;
    }

    // Generate new content
    setIsGenerating(true);
    setError(null);

    try {
      const generatedContent = await generateAllContent(reportData, options);
      
      // Cache the result
      contentCache.set(cacheKey, {
        content: generatedContent,
        timestamp: Date.now(),
      });

      setContent(generatedContent);
      setIsReady(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      console.error('AI content generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on mount and when reportData changes
  useEffect(() => {
    if (!reportData) return;

    // Cancel any in-flight request
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();

    // Delay generation slightly to not block initial render
    const timer = setTimeout(() => {
      generate();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [reportData]);

  return {
    content,
    isGenerating,
    isReady,
    error,
    regenerate: generate,
  };
}

/**
 * Clear all cached content
 */
export function clearAIContentCache(): void {
  contentCache.clear();
}

