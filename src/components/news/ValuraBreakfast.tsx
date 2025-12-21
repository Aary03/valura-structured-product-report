/**
 * Valura Breakfast - Main News Section
 * Sophisticated financial news digest with tabs and email functionality
 */

import { useState, useEffect } from 'react';
import type { ValuraBreakfastDigest } from '../../services/newsAggregator';
import { buildValuraBreakfast } from '../../services/newsAggregator';
import { NewsCard } from './NewsCard';
import { MarketPulseWidget } from './MarketPulseWidget';
import { SentimentTimelineCard } from './SentimentTimelineCard';
import { BreakingNewsBanner } from './BreakingNewsBanner';
import { SectionHeader } from '../common/SectionHeader';

interface ValuraBreakfastProps {
  symbols?: string[]; // Underlying symbols for contextualized news
  onEmailClick?: (digest: ValuraBreakfastDigest) => void;
  compact?: boolean;
}

type TabType = 'underlyings' | 'market' | 'trending';

export function ValuraBreakfast({ symbols, onEmailClick, compact = false }: ValuraBreakfastProps) {
  const [digest, setDigest] = useState<ValuraBreakfastDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(symbols && symbols.length > 0 ? 'underlyings' : 'market');

  useEffect(() => {
    loadBreakfast();
  }, [symbols?.join(',')]); // Reload if symbols change

  const loadBreakfast = async () => {
    setLoading(true);
    setError(null);
    try {
      const freshDigest = await buildValuraBreakfast(symbols);
      setDigest(freshDigest);
    } catch (err) {
      console.error('Failed to load Valura Breakfast:', err);
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={compact ? 'py-8' : 'py-12'}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="text-4xl mb-4">☕</div>
            <div className="text-lg text-muted animate-pulse">Brewing your market intel...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={compact ? 'py-8' : 'py-12'}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="text-4xl mb-4">☕</div>
            <div className="text-lg text-danger-fg mb-4">{error}</div>
            <button
              onClick={loadBreakfast}
              className="px-6 py-2 bg-valura-ink text-white rounded-lg hover:bg-valura-ink/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!digest) return null;

  const hasUnderlyingNews = symbols && symbols.length > 0 && digest.underlyingNews.length > 0;

  return (
    <div className={compact ? 'py-8' : 'py-12'}>
      {/* Breaking News Banner */}
      <BreakingNewsBanner symbols={symbols} autoRefreshMinutes={5} maxArticles={15} />
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">☕</span>
                <SectionHeader
                  title="Valura Breakfast"
                  subtitle="Fresh Market Intel, Served Daily"
                />
              </div>
              <p className="text-sm text-muted ml-14 italic">
                Your sophisticated digest of what's percolating in the markets
              </p>
            </div>

            {/* Email Button */}
            {onEmailClick && (
              <button
                onClick={() => onEmailClick(digest)}
                className="flex items-center gap-2 px-5 py-2.5 bg-valura-ink text-white rounded-lg hover:bg-valura-ink/90 transition-colors shadow-md hover:shadow-lg"
              >
                <span>📧</span>
                <span className="font-medium">Email This Digest</span>
              </button>
            )}
          </div>
        </div>

        {/* Market Pulse Widget */}
        <div className="mb-8">
          <MarketPulseWidget
            marketPulse={digest.marketPulse}
            overallSentiment={digest.overallSentiment}
            lastUpdated={digest.timestamp}
            compact={compact}
          />
        </div>

        {/* Sentiment Timeline (if symbols provided) - Premium Feature */}
        {false && symbols && symbols.length > 0 && symbols.length <= 5 && (
          <div className="mb-8">
            <SentimentTimelineCard symbols={symbols} days={7} />
          </div>
        )}

        {/* Tabs */}
        {hasUnderlyingNews && (
          <div className="flex gap-2 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab('underlyings')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'underlyings'
                  ? 'border-valura-ink text-valura-ink'
                  : 'border-transparent text-muted hover:text-text-primary'
              }`}
            >
              Your Underlyings
              {digest.underlyingNews.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-muted-bg text-muted-fg rounded-full text-xs">
                  {digest.underlyingNews.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'market'
                  ? 'border-valura-ink text-valura-ink'
                  : 'border-transparent text-muted hover:text-text-primary'
              }`}
            >
              Market Pulse
              {digest.marketNews.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-muted-bg text-muted-fg rounded-full text-xs">
                  {digest.marketNews.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'trending'
                  ? 'border-valura-ink text-valura-ink'
                  : 'border-transparent text-muted hover:text-text-primary'
              }`}
            >
              Trending
              {digest.trendingEntities.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-muted-bg text-muted-fg rounded-full text-xs">
                  {digest.trendingEntities.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {/* Your Underlyings Tab */}
          {activeTab === 'underlyings' && hasUnderlyingNews && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  What's Percolating in {symbols!.join(', ')}
                </h3>
                <p className="text-sm text-muted">
                  Latest news and sentiment for your selected underlyings
                </p>
              </div>
              {digest.underlyingNews.map((article) => (
                <NewsCard key={article.uuid} article={article} showEntities compact={compact} />
              ))}
            </>
          )}

          {/* Market Pulse Tab */}
          {activeTab === 'market' && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  The Daily Grind (Market Edition)
                </h3>
                <p className="text-sm text-muted">
                  Broad market news and analysis from top sources
                </p>
              </div>
              {digest.marketNews.map((article) => (
                <NewsCard key={article.uuid} article={article} showEntities compact={compact} />
              ))}
            </>
          )}

          {/* Trending Tab */}
          {activeTab === 'trending' && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Trending Entities
                </h3>
                <p className="text-sm text-muted">
                  Most mentioned stocks in financial news today
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {digest.trendingEntities.map((entity, idx) => {
                  const sentimentColor =
                    entity.sentiment_avg > 0.1
                      ? 'text-success-fg bg-success-bg'
                      : entity.sentiment_avg < -0.1
                        ? 'text-danger-fg bg-danger-bg'
                        : 'text-muted-fg bg-muted-bg';

                  return (
                    <div
                      key={`${entity.symbol}-${idx}`}
                      className="p-4 bg-surface border border-border rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-mono font-bold text-lg text-text-primary">
                            {entity.symbol}
                          </div>
                          <div className="text-sm text-muted line-clamp-1">{entity.name}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${sentimentColor}`}>
                          {entity.sentiment_avg > 0 ? '↗' : entity.sentiment_avg < 0 ? '↘' : '→'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span>{entity.mentions} mentions</span>
                        <span>•</span>
                        <span>
                          {(entity.sentiment_avg * 100).toFixed(0)}% sentiment
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Empty State */}
        {((activeTab === 'underlyings' && (!hasUnderlyingNews || digest.underlyingNews.length === 0)) ||
          (activeTab === 'market' && digest.marketNews.length === 0) ||
          (activeTab === 'trending' && digest.trendingEntities.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">☕</div>
            <div className="text-lg text-muted">No news brewing yet</div>
            <p className="text-sm text-muted mt-2">Check back soon for fresh market intel</p>
          </div>
        )}
      </div>
    </div>
  );
}

