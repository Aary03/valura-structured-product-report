/**
 * Market Pulse Widget
 * Compact stats card showing market sentiment and trending entities
 */

import type { ValuraBreakfastDigest } from '../../services/newsAggregator';
import { CardShell } from '../common/CardShell';

interface MarketPulseWidgetProps {
  marketPulse: ValuraBreakfastDigest['marketPulse'];
  overallSentiment: ValuraBreakfastDigest['overallSentiment'];
  lastUpdated?: string;
  compact?: boolean;
}

export function MarketPulseWidget({
  marketPulse,
  overallSentiment,
  lastUpdated,
  compact = false,
}: MarketPulseWidgetProps) {
  const sentimentGradient =
    overallSentiment === 'bullish'
      ? 'from-success-bg to-success-bg/50'
      : overallSentiment === 'bearish'
        ? 'from-danger-bg to-danger-bg/50'
        : 'from-muted-bg to-muted-bg/50';

  const sentimentIcon =
    overallSentiment === 'bullish' ? '📈' : overallSentiment === 'bearish' ? '📉' : '➡️';

  return (
    <CardShell className={`bg-gradient-to-br ${sentimentGradient} ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{sentimentIcon}</span>
          <h3 className={`font-bold text-text-primary ${compact ? 'text-base' : 'text-lg'}`}>
            Today's Market Pulse
          </h3>
        </div>
        {lastUpdated && (
          <span className="text-xs text-muted">
            Updated {new Date(lastUpdated).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Vibe */}
      <div className="mb-4">
        <div className="text-xl font-bold text-text-primary mb-1">{marketPulse.vibe}</div>
        <div className="text-sm text-muted italic">{marketPulse.description}</div>
      </div>

      {/* Top Movers */}
      <div>
        <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
          Trending Now
        </div>
        <div className="space-y-2">
          {marketPulse.topMovers.map((mover, idx) => {
            const directionColor =
              mover.direction === 'up'
                ? 'text-success-fg'
                : mover.direction === 'down'
                  ? 'text-danger-fg'
                  : 'text-muted-fg';

            const directionIcon =
              mover.direction === 'up' ? '↗' : mover.direction === 'down' ? '↘' : '→';

            return (
              <div
                key={`${mover.symbol}-${idx}`}
                className="flex items-center justify-between bg-surface/50 backdrop-blur-sm rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-text-primary">
                    {mover.symbol}
                  </span>
                  <span className="text-xs text-muted line-clamp-1">{mover.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{mover.mentions} mentions</span>
                  <span className={`text-lg ${directionColor}`}>{directionIcon}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      {!compact && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted italic">
            Aggregated from {marketPulse.topMovers.reduce((sum, m) => sum + m.mentions, 0)}+ news
            mentions across top financial sources
          </p>
        </div>
      )}
    </CardShell>
  );
}














