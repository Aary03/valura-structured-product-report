/**
 * Risks Component
 * Key risks in plain English
 */

import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';
import { AlertTriangle } from 'lucide-react';

interface RiskItem {
  text: string;
}

function getRiskItems(productType: 'RC' | 'CPPN', kiEnabled?: boolean): RiskItem[] {
  if (productType === 'CPPN') {
    return [
      { text: 'Issuer credit risk: “capital protection” depends on the issuer’s ability to pay at maturity.' },
      { text: 'Liquidity risk: secondary market pricing may be below notional before maturity.' },
      { text: 'Participation may be capped, limiting upside even if the underlying performs strongly.' },
      ...(kiEnabled
        ? [{ text: 'Knock-in risk (if enabled): if final level is below KI, payoff switches to a geared-put regime (100×X/S), which can increase downside exposure.' }]
        : []),
      { text: 'Model/assumption risk: this is an indicative illustration for education, not an offer.' },
    ];
  }

  return [
    {
      text: 'Capital is at risk if the barrier is breached at maturity. You may receive shares worth less than your initial investment.',
    },
    {
      text: 'You may receive shares instead of cash if the underlying stock (or worst-performing stock in a basket) is below the barrier at maturity.',
    },
    {
      text: 'Issuer credit risk: If the issuer defaults, you may lose some or all of your investment, including unpaid coupons.',
    },
    {
      text: 'Early exit may be at a discount. These products are typically designed to be held to maturity, and selling early may result in losses.',
    },
    {
      text: 'Market risk: The value of shares received at conversion depends on the stock price at maturity, which may be significantly lower than the reference price.',
    },
  ];
}

export function Risks({ productType = 'RC', kiEnabled }: { productType?: 'RC' | 'CPPN'; kiEnabled?: boolean }) {
  const riskItems = getRiskItems(productType, kiEnabled);
  return (
    <CardShell className="p-6">
      <SectionHeader
        title="Risks"
        subtitle="Important risks to consider before investing"
      />
      
      <div className="mt-6 space-y-4">
        {riskItems.map((risk, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <AlertTriangle className="w-5 h-5 text-warning-fg" />
            </div>
            <p className="text-muted flex-1">{risk.text}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-warning-bg rounded-lg border" style={{ borderColor: 'rgba(148,98,0,0.25)' }}>
        <p className="text-sm text-muted">
          <strong className="text-warning-fg">Important:</strong> This is an indicative report for educational purposes. 
          Before investing, carefully review the full product documentation, including the prospectus and risk factors. 
          Past performance of the underlying stocks does not guarantee future results.
        </p>
      </div>
    </CardShell>
  );
}

