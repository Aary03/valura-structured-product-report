/**
 * Breaking News Banner
 * Horizontal scrolling ticker with auto-refresh
 */

import { useState, useEffect, useRef } from 'react';
import { fetchMarketNews, getDateDaysAgo } from '../../services/api/marketaux';
import type { MarketauxNewsArticle } from '../../services/api/marketaux';
import { Zap } from 'lucide-react';

interface BreakingNewsBannerProps {
  autoRefreshMinutes?: number;
  maxArticles?: number;
  symbols?: string[]; // Optional: filter by symbols
}

export function BreakingNewsBanner({
  autoRefreshMinutes = 5,
  maxArticles = 10,
  symbols,
}: BreakingNewsBannerProps) {
  const [articles, setArticles] = useState<MarketauxNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBreakingNews();
    
    // Auto-refresh
    const interval = setInterval(() => {
      loadBreakingNews();
    }, autoRefreshMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [symbols?.join(',')]);

  const loadBreakingNews = async () => {
    try {
      // Fetch news from last 6 hours (using YYYY-MM-DDTHH format required by Marketaux)
      const now = new Date();
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      
      // Format: YYYY-MM-DDTHH (no minutes/seconds for broader window)
      const formattedDate = `${sixHoursAgo.getFullYear()}-${String(sixHoursAgo.getMonth() + 1).padStart(2, '0')}-${String(sixHoursAgo.getDate()).padStart(2, '0')}T${String(sixHoursAgo.getHours()).padStart(2, '0')}`;
      
      const response = await fetchMarketNews({
        symbols,
        limit: maxArticles,
        language: 'en',
        publishedAfter: formattedDate,
        mustHaveEntities: true,
      });

      setArticles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load breaking news:', error);
      setLoading(false);
    }
  };

  // Calculate time since published
  const getTimeSince = (publishedAt: string): string => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now.getTime() - published.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  if (loading || articles.length === 0) {
    return null; // Don't show banner if no breaking news
  }

  return (
    <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 border-y border-red-600/50 overflow-hidden">
      <div className="flex items-center">
        {/* Breaking News Label */}
        <div className="flex-shrink-0 bg-red-600 px-4 py-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-white animate-pulse" fill="white" />
          <span className="text-white font-bold text-sm uppercase tracking-wide">
            Breaking
          </span>
        </div>

        {/* Scrolling News Items */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-hidden"
        >
          <div className="flex animate-scroll-left">
            {/* Duplicate items for seamless loop */}
            {[...articles, ...articles].map((article, index) => (
              <a
                key={`${article.uuid}-${index}`}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 px-6 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors"
              >
                <span className="text-white/90 text-xs font-medium">
                  {getTimeSince(article.published_at)} ago
                </span>
                <span className="text-white text-sm font-medium">
                  {article.title}
                </span>
                {article.entities.length > 0 && (
                  <span className="text-white/70 text-xs font-mono">
                    {article.entities.slice(0, 2).map(e => e.symbol).join(', ')}
                  </span>
                )}
                <span className="text-white/50 mx-2">•</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Custom scrolling animation */}
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-left {
          animation: scroll-left 60s linear infinite;
        }
        
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

