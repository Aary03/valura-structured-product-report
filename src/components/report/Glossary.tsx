/**
 * Glossary Component
 * Plain English definitions of key terms
 */

import { useState } from 'react';
import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'Coupon',
    definition: 'Regular interest payments paid to you during the life of the product, typically quarterly or monthly.',
  },
  {
    term: 'Barrier (European)',
    definition: 'A threshold level checked only at maturity. If the underlying is above the barrier at maturity, you get your principal back in cash. If below, you receive shares instead.',
  },
  {
    term: 'Worst-of',
    definition: 'For basket products, the payoff depends on the worst-performing stock in the basket. At maturity, the lowest stock level determines whether you receive cash or shares.',
  },
  {
    term: 'Share Conversion',
    definition: 'If the barrier is breached at maturity, instead of cash, you receive shares of the underlying stock (or worst-performing stock in a basket). The number of shares is calculated based on the reference price and conversion ratio.',
  },
  {
    term: 'Reference Price',
    definition: 'The price used to calculate the barrier level and conversion shares. For idea reports, this typically defaults to today\'s spot price unless a custom reference date is specified.',
  },
];

export function Glossary() {
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  return (
    <CardShell className="p-6">
      <SectionHeader
        title="Glossary (Plain English)"
        subtitle="Key terms explained in simple language"
      />
      
      <div className="mt-6 space-y-2">
        {glossaryTerms.map((item) => {
          const isExpanded = expandedTerm === item.term;
          
          return (
            <div 
              key={item.term}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedTerm(isExpanded ? null : item.term)}
                className="w-full flex items-center justify-between p-4 hover:bg-grey-background transition-colors text-left"
              >
                <span className="font-semibold text-text-primary">{item.term}</span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-text-secondary" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-secondary" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 text-text-secondary">
                  {item.definition}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

