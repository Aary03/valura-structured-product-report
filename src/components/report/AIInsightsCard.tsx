/**
 * AI Investment Insights Card
 * Displays AI-generated investment insights in a beautiful, actionable format
 */

import { useState } from 'react';
import type { InvestmentInsights } from '../../services/aiInsights';
import { askAIQuestion } from '../../services/aiInsights';
import { CardShell } from '../common/CardShell';
import { Sparkles, TrendingUp, AlertCircle, Target, MessageCircle, Send, Loader2 } from 'lucide-react';

interface AIInsightsCardProps {
  insights: InvestmentInsights;
  symbol: string;
  companyName: string;
  description: string;
  productType: string;
  currentMetrics: string;
}

export function AIInsightsCard({
  insights,
  symbol,
  companyName,
  description,
  productType,
  currentMetrics,
}: AIInsightsCardProps) {
  const [showQA, setShowQA] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim() || isAsking) return;

    setIsAsking(true);
    setAnswer('');

    const response = await askAIQuestion(question, {
      symbol,
      companyName,
      description,
      productType,
      currentMetrics,
    });

    setAnswer(response);
    setIsAsking(false);
  };

  return (
    <CardShell 
      className="p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
        borderLeft: '4px solid #3b82f6',
        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -1px rgba(59, 130, 246, 0.1)',
      }}
    >
      {/* Sparkle decoration */}
      <div className="absolute top-4 right-4">
        <Sparkles className="w-6 h-6 text-primary opacity-20" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-blue-light flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-base font-bold text-text-primary">AI Investment Insights</h4>
            <p className="text-xs text-text-secondary">Powered by GPT-4 + Real-Time Market Data</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-success-light border border-success">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-semibold text-success">LIVE</span>
        </div>
      </div>

      {/* Quick Take */}
      <div className="mb-5 p-3 rounded-lg bg-white/60 border border-primary/20">
        <p className="text-sm font-medium text-text-primary italic">
          "{insights.quickTake}"
        </p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Strengths */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-success" />
            <h5 className="text-sm font-bold text-success">Key Strengths</h5>
          </div>
          <ul className="space-y-2">
            {insights.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-success mt-0.5">✓</span>
                <span className="text-xs text-text-secondary leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Considerations */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-4 h-4 text-warning" />
            <h5 className="text-sm font-bold text-warning">Considerations</h5>
          </div>
          <ul className="space-y-2">
            {insights.considerations.map((consideration, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-warning mt-0.5">⚠</span>
                <span className="text-xs text-text-secondary leading-relaxed">{consideration}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suited For */}
      <div className="mb-4 p-3 rounded-lg bg-white/60 border border-primary/20">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-4 h-4 text-primary" />
          <h5 className="text-xs font-bold text-primary uppercase tracking-wide">Best Suited For</h5>
        </div>
        <p className="text-sm text-text-secondary">{insights.suitedFor}</p>
      </div>

      {/* Ask AI Button */}
      <button
        onClick={() => setShowQA(!showQA)}
        className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-blue-light text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 font-semibold text-sm"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{showQA ? 'Hide Q&A' : 'Ask AI a Question'}</span>
      </button>

      {/* Q&A Section */}
      {showQA && (
        <div className="mt-4 p-4 rounded-lg bg-white/80 border border-primary/20">
          {/* Quick Questions */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-text-secondary mb-2">Quick Questions:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'What are the biggest risks right now?',
                'How volatile is this stock?',
                'Is the current price attractive?',
                'What if the stock drops 15%?',
                'How strong are the fundamentals?',
              ].map((quickQ, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(quickQ);
                    setAnswer('');
                  }}
                  className="px-2 py-1 rounded-md bg-primary-light text-primary text-xs hover:bg-primary hover:text-white transition-colors border border-primary/30"
                  disabled={isAsking}
                >
                  {quickQ}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Question Input */}
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder="Or type your own question..."
              className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isAsking}
            />
            <button
              onClick={handleAskQuestion}
              disabled={!question.trim() || isAsking}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-blue-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAsking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {answer && (
            <div className="p-3 rounded-lg bg-primary-light border border-primary/30">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-text-secondary leading-relaxed">{answer}</p>
              </div>
            </div>
          )}

          {isAsking && (
            <div className="flex items-center justify-center py-4 text-sm text-text-secondary">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Analyzing real-time market data...
            </div>
          )}
        </div>
      )}
    </CardShell>
  );
}

