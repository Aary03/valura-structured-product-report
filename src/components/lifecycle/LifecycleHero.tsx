/**
 * Lifecycle Hero Component
 * Unified header for all structured product types
 */

import type { ProductLifecycleData } from '../../types/lifecycle';
import { getBucketInfo, getEarnRiskLines } from '../../types/lifecycle';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface LifecycleHeroProps {
  data: ProductLifecycleData;
}

export function LifecycleHero({ data }: LifecycleHeroProps) {
  const bucketInfo = getBucketInfo(data.bucket);
  const { earnLine, riskLine } = getEarnRiskLines(data);
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Content */}
      <div className="relative px-8 py-8">
        {/* Bucket Pill + ISIN */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{bucketInfo.emoji}</span>
            <div 
              className="px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide shadow-lg"
              style={{ 
                backgroundColor: bucketInfo.bgColor,
                color: bucketInfo.color,
              }}
            >
              {bucketInfo.label}
            </div>
          </div>
          
          {data.isin && (
            <div className="text-sm text-white/60 font-mono">
              ISIN: {data.isin}
            </div>
          )}
        </div>
        
        {/* Product Name */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {data.productDisplayName}
        </h1>
        
        {/* Earn + Risk Lines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Earn */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-green-400 mb-1">
                Earn
              </div>
              <div className="text-sm text-white/90 leading-relaxed">
                {earnLine}
              </div>
            </div>
          </div>
          
          {/* Risk */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-400 mb-1">
                Risk
              </div>
              <div className="text-sm text-white/90 leading-relaxed">
                {riskLine}
              </div>
            </div>
          </div>
        </div>
        
        {/* Basket type indicator */}
        <div className="mt-6 flex items-center gap-2 text-xs text-white/60">
          <span className="font-semibold uppercase tracking-wide">Basket:</span>
          <span>
            {data.basketType === 'worst_of' && 'Worst performer drives outcome'}
            {data.basketType === 'best_of' && 'Best performer drives outcome'}
            {data.basketType === 'average' && 'Average performance drives outcome'}
            {data.basketType === 'equally_weighted' && 'Equally weighted basket'}
            {data.basketType === 'single' && 'Single underlying'}
          </span>
        </div>
      </div>
    </div>
  );
}
