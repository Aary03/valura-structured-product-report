/**
 * News Card Component
 * Individual article display with sophisticated styling
 */

import type { ProcessedNewsArticle } from '../../services/newsAggregator';
import { formatTimeAgo, getSentimentLabel, getSentimentColor } from '../../services/newsAggregator';
import { CardShell } from '../common/CardShell';

interface NewsCardProps {
  article: ProcessedNewsArticle;
  showEntities?: boolean;
  compact?: boolean;
}

export function NewsCard({ article, showEntities = true, compact = false }: NewsCardProps) {
  const sentimentColor = getSentimentColor(article.sentimentCategory);
  const sentimentBadgeClass =
    sentimentColor === 'success'
      ? 'bg-success-bg text-success-fg'
      : sentimentColor === 'danger'
        ? 'bg-danger-bg text-danger-fg'
        : 'bg-muted-bg text-muted-fg';

  const topEntities = article.entities
    .filter((e) => e.match_score > 50)
    .slice(0, 3)
    .sort((a, b) => b.match_score - a.match_score);

  return (
    <CardShell hover className={compact ? 'p-4' : 'p-5'}>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="flex gap-4">
          {/* Image */}
          {article.image_url && !compact && (
            <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted-bg">
              <img
                src={article.image_url}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header: Sentiment + Source + Time */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sentimentBadgeClass}`}>
                {getSentimentLabel(article.sentimentCategory)}
              </span>
              <span className="text-xs text-muted">
                {article.source} · {formatTimeAgo(article.published_at)}
              </span>
            </div>

            {/* Title */}
            <h3
              className={`font-semibold text-text-primary group-hover:text-valura-ink transition-colors mb-2 line-clamp-2 ${
                compact ? 'text-sm' : 'text-base'
              }`}
            >
              {article.sophisticatedHeadline || article.title}
            </h3>

            {/* Snippet */}
            {!compact && article.snippet && (
              <p className="text-sm text-muted line-clamp-2 mb-3">{article.snippet}</p>
            )}

            {/* Entity Chips */}
            {showEntities && topEntities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topEntities.map((entity, idx) => {
                  const entitySentimentColor =
                    entity.sentiment_score > 0.1
                      ? 'text-success-fg bg-success-bg'
                      : entity.sentiment_score < -0.1
                        ? 'text-danger-fg bg-danger-bg'
                        : 'text-muted-fg bg-muted-bg';

                  return (
                    <span
                      key={`${entity.symbol}-${idx}`}
                      className={`px-2 py-1 rounded text-xs font-mono font-medium ${entitySentimentColor}`}
                    >
                      {entity.symbol}
                      {entity.sentiment_score !== 0 && (
                        <span className="ml-1">
                          {entity.sentiment_score > 0 ? '↗' : '↘'}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </a>
    </CardShell>
  );
}








