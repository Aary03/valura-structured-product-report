/**
 * Company Descriptions Container
 * Renders company description cards for all underlyings
 */

import type { UnderlyingSummary } from '../../services/underlyingSummary';
import { SectionHeader } from '../common/SectionHeader';
import { CompanyDescriptionCard } from './CompanyDescriptionCard';

interface CompanyDescriptionsProps {
  summaries: UnderlyingSummary[];
  productType?: 'RC' | 'CPPN';
  barrierPct?: number;
}

export function CompanyDescriptions({ 
  summaries, 
  productType = 'RC',
  barrierPct = 0.7 
}: CompanyDescriptionsProps) {
  // Filter summaries that have descriptions
  const summariesWithDescriptions = summaries.filter(s => s.description);

  // Don't render section if no descriptions available
  if (summariesWithDescriptions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <SectionHeader
        title="Company Backgrounds & AI Investment Insights"
        subtitle="Business descriptions, key details, and intelligent analysis powered by AI"
      />
      <div className="mt-4 space-y-4">
        {summariesWithDescriptions.map((summary) => (
          <CompanyDescriptionCard 
            key={summary.symbol} 
            summary={summary}
            productType={productType}
            barrierPct={barrierPct}
          />
        ))}
      </div>
    </div>
  );
}







