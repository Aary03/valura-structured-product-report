/**
 * Valura Breakfast Enhanced - Free Tier Optimized
 * Maximum impact using only free Marketaux features
 */

import { useState, useEffect } from 'react';
import { fetchMarketNews } from '../../services/api/marketaux';
import { processArticles } from '../../services/newsAggregator';
import type { ProcessedNewsArticle } from '../../services/newsAggregator';
import { NewsCard } from './NewsCard';
import { BreakingNewsBanner } from './BreakingNewsBanner';
import { TrendingUp, TrendingDown, Newspaper, BarChart3, Mail } from 'lucide-react';

interface ValuraBreakfastEnhancedProps {
  symbols?: string[];
  onEmailClick?: (data: any) => void;
}

export function ValuraBreakfastEnhanced({ symbols, onEmailClick }: ValuraBreakfastEnhancedProps) {
  const [bullishNews, setBullishNews] = useState<ProcessedNewsArticle[]>([]);
  const [bearishNews, setBearishNews] = useState<ProcessedNewsArticle[]>([]);
  const [techNews, setTechNews] = useState<ProcessedNewsArticle[]>([]);
  const [financeNews, setFinanceNews] = useState<ProcessedNewsArticle[]>([]);
  const [underlyingNews, setUnderlyingNews] = useState<ProcessedNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'bullish' | 'bearish' | 'tech' | 'finance'>('all');

  useEffect(() => {
    loadAllNews();
  }, [symbols?.join(',')]);

  const loadAllNews = async () => {
    setLoading(true);
    try {
      const promises = [];

      // Bullish news (positive sentiment)
      promises.push(
        fetchMarketNews({
          sentimentGte: 0.2,
          limit: 10,
          language: 'en',
          mustHaveEntities: true,
        }).then(r => processArticles(r.data))
      );

      // Bearish news (negative sentiment)
      promises.push(
        fetchMarketNews({
          sentimentLte: -0.2,
          limit: 10,
          language: 'en',
          mustHaveEntities: true,
        }).then(r => processArticles(r.data))
      );

      // Technology industry
      promises.push(
        fetchMarketNews({
          industries: ['Technology'],
          limit: 10,
          language: 'en',
          mustHaveEntities: true,
        }).then(r => processArticles(r.data))
      );

      // Financial services
      promises.push(
        fetchMarketNews({
          industries: ['Financial Services', 'Finance'],
          limit: 10,
          language: 'en',
          mustHaveEntities: true,
        }).then(r => processArticles(r.data))
      );

      // Underlying-specific news if provided
      if (symbols && symbols.length > 0) {
        promises.push(
          fetchMarketNews({
            symbols,
            limit: 15,
            language: 'en',
            filterEntities: true,
          }).then(r => processArticles(r.data, symbols))
        );
      } else {
        promises.push(Promise.resolve([]));
      }

      const [bullish, bearish, tech, finance, underlying] = await Promise.all(promises);

      setBullishNews(bullish);
      setBearishNews(bearish);
      setTechNews(tech);
      setFinanceNews(finance);
      setUnderlyingNews(underlying);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall stats
  const totalArticles = bullishNews.length + bearishNews.length + techNews.length + financeNews.length;
  const bullishRatio = totalArticles > 0 ? (bullishNews.length / totalArticles) * 100 : 50;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-grad)' }}>
      {/* Breaking News Banner */}
      <BreakingNewsBanner symbols={symbols} autoRefreshMinutes={5} maxArticles={15} />

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-valura-ink via-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-[300px]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-6xl animate-bounce-slow">☕</span>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">Valura Breakfast</h1>
                  <p className="text-xl text-white/90 italic">Fresh Market Intel, Served Daily</p>
                </div>
              </div>
              <p className="text-lg text-white/80 max-w-2xl">
                Your sophisticated digest of what's percolating in the markets. Real-time news, sentiment analysis, and actionable insights.
              </p>
            </div>

            {/* Market Vibe Gauge */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 min-w-[280px]">
              <div className="text-sm font-semibold uppercase tracking-wide mb-3 opacity-90">
                Today's Market Vibe
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">
                  {bullishRatio > 60 ? '📈' : bullishRatio < 40 ? '📉' : '➡️'}
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {bullishRatio > 60 ? 'Bullish' : bullishRatio < 40 ? 'Bearish' : 'Mixed'}
                  </div>
                  <div className="text-sm opacity-80">{totalArticles} articles analyzed</div>
                </div>
              </div>
              
              {/* Sentiment Bar */}
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-1000"
                  style={{ width: `${bullishRatio}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-2 opacity-75">
                <span>Bearish</span>
                <span>Bullish</span>
              </div>
            </div>

            {onEmailClick && (
              <button
                onClick={() => {
                  const totalArticles = bullishNews.length + bearishNews.length + techNews.length + financeNews.length;
                  const bullishRatio = totalArticles > 0 ? (bullishNews.length / totalArticles) * 100 : 50;
                  const marketVibe = bullishRatio > 60 ? 'Bullish' : bullishRatio < 40 ? 'Bearish' : 'Mixed';
                  
                  onEmailClick({
                    bullishNews,
                    bearishNews,
                    techNews,
                    financeNews,
                    marketVibe,
                    bullishRatio,
                    timestamp: new Date().toISOString(),
                  });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white text-valura-ink rounded-lg hover:bg-white/90 transition-colors font-semibold shadow-lg"
              >
                <Mail className="w-5 h-5" />
                Email Digest
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-success-bg border border-success-fg/20 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-success-fg" />
              <div className="text-3xl font-bold text-success-fg">{bullishNews.length}</div>
            </div>
            <div className="text-sm font-semibold text-success-fg">Bullish Stories</div>
            <div className="text-xs text-muted mt-1">Positive sentiment</div>
          </div>

          <div className="bg-danger-bg border border-danger-fg/20 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 text-danger-fg" />
              <div className="text-3xl font-bold text-danger-fg">{bearishNews.length}</div>
            </div>
            <div className="text-sm font-semibold text-danger-fg">Bearish Stories</div>
            <div className="text-xs text-muted mt-1">Negative sentiment</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Newspaper className="w-8 h-8 text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">{techNews.length}</div>
            </div>
            <div className="text-sm font-semibold text-blue-600">Tech News</div>
            <div className="text-xs text-muted mt-1">Technology sector</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="text-3xl font-bold text-purple-600">{financeNews.length}</div>
            </div>
            <div className="text-sm font-semibold text-purple-600">Finance News</div>
            <div className="text-xs text-muted mt-1">Financial services</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-valura-ink text-white shadow-lg'
                : 'bg-surface hover:bg-muted-bg text-text-primary'
            }`}
          >
            All News
          </button>
          <button
            onClick={() => setActiveTab('bullish')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'bullish'
                ? 'bg-success-fg text-white shadow-lg'
                : 'bg-surface hover:bg-muted-bg text-text-primary'
            }`}
          >
            📈 Bullish
          </button>
          <button
            onClick={() => setActiveTab('bearish')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'bearish'
                ? 'bg-danger-fg text-white shadow-lg'
                : 'bg-surface hover:bg-muted-bg text-text-primary'
            }`}
          >
            📉 Bearish
          </button>
          <button
            onClick={() => setActiveTab('tech')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'tech'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-surface hover:bg-muted-bg text-text-primary'
            }`}
          >
            💻 Technology
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'finance'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-surface hover:bg-muted-bg text-text-primary'
            }`}
          >
            💰 Finance
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-valura-ink border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg text-muted">Brewing your market intel...</p>
          </div>
        )}

        {/* Content Sections */}
        {!loading && (
          <div className="space-y-4">
            {/* Underlying News (if symbols provided) */}
            {activeTab === 'all' && underlyingNews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  📊 Your Underlyings: {symbols?.join(', ')}
                </h2>
                {underlyingNews.map(article => (
                  <NewsCard key={article.uuid} article={article} showEntities />
                ))}
              </div>
            )}

            {/* Bullish News */}
            {(activeTab === 'all' || activeTab === 'bullish') && bullishNews.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  📈 Bulls Are Feasting
                </h2>
                {bullishNews.map(article => (
                  <NewsCard key={article.uuid} article={article} showEntities />
                ))}
              </>
            )}

            {/* Bearish News */}
            {(activeTab === 'all' || activeTab === 'bearish') && bearishNews.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  📉 Bears Prowling
                </h2>
                {bearishNews.map(article => (
                  <NewsCard key={article.uuid} article={article} showEntities />
                ))}
              </>
            )}

            {/* Tech News */}
            {(activeTab === 'all' || activeTab === 'tech') && techNews.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  💻 Technology Sector
                </h2>
                {techNews.map(article => (
                  <NewsCard key={article.uuid} article={article} showEntities />
                ))}
              </>
            )}

            {/* Finance News */}
            {(activeTab === 'all' || activeTab === 'finance') && financeNews.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  💰 Financial Services
                </h2>
                {financeNews.map(article => (
                  <NewsCard key={article.uuid} article={article} showEntities />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Custom styles */}
      <style>{`
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

