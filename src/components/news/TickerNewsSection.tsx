/**
 * Ticker News Section
 * Collapsible news feed for individual stocks in reports
 */

import { useState, useEffect } from 'react';
import { fetchEntityNews } from '../../services/api/marketaux';
import type { ProcessedNewsArticle } from '../../services/newsAggregator';
import { processArticles, formatTimeAgo, getSentimentLabel, getSentimentColor } from '../../services/newsAggregator';
import { ChevronDown, ChevronUp, Newspaper } from 'lucide-react';

interface TickerNewsSectionProps {
  symbol: string;
  companyName: string;
  defaultExpanded?: boolean;
  maxArticles?: number;
}

export function TickerNewsSection({
  symbol,
  companyName,
  defaultExpanded = false,
  maxArticles = 5,
}: TickerNewsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [articles, setArticles] = useState<ProcessedNewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isExpanded && articles.length === 0) {
      loadNews();
    }
  }, [isExpanded]);

  const loadNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchEntityNews([symbol], {
        limit: maxArticles,
        language: 'en',
      });
      
      const processed = processArticles(response.data, [symbol]);
      setArticles(processed);
    } catch (err) {
      console.error('Failed to load ticker news:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  // Calculate average sentiment
  const avgSentiment = articles.length > 0
    ? articles.reduce((sum, a) => {
        const entity = a.entities.find(e => e.symbol === symbol);
        return sum + (entity?.sentiment_score || 0);
      }, 0) / articles.length
    : 0;

  const sentimentCategory = avgSentiment > 0.1 ? 'bullish' : avgSentiment < -0.1 ? 'bearish' : 'neutral';

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface">
      {/* Header (Collapsible Toggle) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3 flex items-center justify-between hover:bg-muted-bg/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Newspaper className="w-5 h-5 text-valura-ink" />
          <div className="text-left">
            <div className="font-semibold text-text-primary">
              Latest News: {symbol}
            </div>
            <div className="text-sm text-muted">{companyName}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {articles.length > 0 && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              sentimentCategory === 'bullish'
                ? 'bg-success-bg text-success-fg'
                : sentimentCategory === 'bearish'
                  ? 'bg-danger-bg text-danger-fg'
                  : 'bg-muted-bg text-muted-fg'
            }`}>
              {getSentimentLabel(sentimentCategory)}
            </span>
          )}
          
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-border">
          {loading && (
            <div className="p-6 text-center">
              <div className="inline-block w-6 h-6 border-2 border-valura-ink border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted mt-2">Loading news...</p>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <p className="text-sm text-danger-fg">{error}</p>
              <button
                onClick={loadNews}
                className="mt-2 text-sm text-valura-ink hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-muted">No recent news available</p>
            </div>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="divide-y divide-border">
              {articles.map((article) => {
                const entity = article.entities.find(e => e.symbol === symbol);
                const sentimentColor = getSentimentColor(article.sentimentCategory);
                
                return (
                  <a
                    key={article.uuid}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-5 py-4 hover:bg-muted-bg/50 transition-colors"
                  >
                    <div className="flex gap-3">
                      {article.image_url && (
                        <div className="flex-shrink-0 w-20 h-16 rounded overflow-hidden bg-muted-bg">
                          <img
                            src={article.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            sentimentColor === 'success'
                              ? 'bg-success-bg text-success-fg'
                              : sentimentColor === 'danger'
                                ? 'bg-danger-bg text-danger-fg'
                                : 'bg-muted-bg text-muted-fg'
                          }`}>
                            {entity?.sentiment_score !== undefined 
                              ? `${(entity.sentiment_score * 100).toFixed(0)}%`
                              : 'N/A'
                            }
                          </span>
                          <span className="text-xs text-muted">
                            {article.source} · {formatTimeAgo(article.published_at)}
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-semibold text-text-primary line-clamp-2 mb-1">
                          {article.title}
                        </h4>
                        
                        {article.snippet && (
                          <p className="text-xs text-muted line-clamp-2">
                            {article.snippet}
                          </p>
                        )}
                        
                        {entity?.highlights && entity.highlights.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted italic line-clamp-1">
                              "{entity.highlights[0].highlight.substring(0, 120)}..."
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}













