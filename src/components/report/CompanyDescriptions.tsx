/**
 * Company Descriptions Container
 * Now uses combined cards that integrate spotlight metrics, company info, and AI analysis
 * Reduces vertical scrolling with smart tabbed layout
 */

import type { UnderlyingSummary } from '../../services/underlyingSummary';
import type { ReverseConvertibleTerms } from '../../products/reverseConvertible/terms';
import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import { SectionHeader } from '../common/SectionHeader';
import { UnderlyingCombinedCard } from './UnderlyingCombinedCard';

type ProductTerms = ReverseConvertibleTerms | CapitalProtectedParticipationTerms;

interface CompanyDescriptionsProps {
  summaries: UnderlyingSummary[];
  productType?: 'RC' | 'CPPN';
  barrierPct?: number;
  productTerms?: ProductTerms;
}

export function CompanyDescriptions({ 
  summaries, 
  productType = 'RC',
  barrierPct = 0.7,
  productTerms
}: CompanyDescriptionsProps) {
  // Filter summaries that have descriptions
  const summariesWithDescriptions = summaries.filter(s => s.description);

  // Don't render section if no descriptions available
  if (summariesWithDescriptions.length === 0) {
    return null;
  }

  // Determine basket type and position for each underlying
  const basketType = productTerms?.basketType || 'single';
  
  // For basket products, determine each underlying's position
  const getBasketPosition = (index: number): string | undefined => {
    if (basketType === 'single') return undefined;
    if (summariesWithDescriptions.length === 1) return undefined;
    
    // Simple heuristic based on performance
    const sorted = [...summariesWithDescriptions].sort((a, b) => 
      (a.performancePct || 0) - (b.performancePct || 0)
    );
    const position = sorted.findIndex(s => s.symbol === summariesWithDescriptions[index].symbol);
    
    if (basketType === 'worst_of') {
      if (position === 0) return 'Worst performer (determines payoff)';
      if (position === sorted.length - 1) return 'Best performer';
      return 'Middle performer';
    } else if (basketType === 'best_of') {
      if (position === sorted.length - 1) return 'Best performer (determines payoff)';
      if (position === 0) return 'Worst performer';
      return 'Middle performer';
    } else if (basketType === 'average') {
      return 'Part of average basket';
    }
    
    return undefined;
  };

  // Determine which underlying is worst performer for styling
  const worstPerformerIndex = summariesWithDescriptions.length > 1 && basketType === 'worst_of'
    ? summariesWithDescriptions.reduce((worstIdx, curr, idx, arr) => 
        (curr.performancePct || 0) < (arr[worstIdx].performancePct || 0) ? idx : worstIdx
      , 0)
    : -1;

  return (
    <div className="mb-6">
      <SectionHeader
        title="Underlying Analysis Hub"
        subtitle="Integrated metrics, company backgrounds, and AI-powered insights in one place"
      />
      <div className="mt-4 space-y-4">
        {summariesWithDescriptions.map((summary, index) => (
          <UnderlyingCombinedCard 
            key={summary.symbol} 
            summary={summary}
            productType={productType}
            barrierPct={barrierPct}
            productTerms={productTerms}
            basketType={basketType}
            basketPosition={getBasketPosition(index)}
            isWorstPerformer={index === worstPerformerIndex}
          />
        ))}
      </div>
    </div>
  );
}







