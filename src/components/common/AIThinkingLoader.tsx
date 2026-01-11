/**
 * AI Thinking Loader
 * Beautiful animated loader with rotating investment facts
 * Shows while AI is generating insights
 */

import { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, BarChart3, Activity } from 'lucide-react';

const investmentFacts = [
  "📊 Analyzing real-time market sentiment...",
  "📰 Fetching latest news and developments...",
  "🔍 Evaluating analyst recommendations...",
  "📈 Assessing technical indicators...",
  "💡 Synthesizing fundamental data...",
  "🎯 Calculating risk-adjusted returns...",
  "🌐 Reviewing sector performance trends...",
  "📉 Analyzing volatility patterns...",
  "🏦 Checking institutional holdings...",
  "💰 Evaluating valuation metrics...",
  "🔮 Generating investment insights...",
  "⚡ Processing financial data streams...",
  "🎲 Modeling probability distributions...",
  "🧠 Applying AI algorithms...",
  "📱 Scanning market indicators...",
];

interface AIThinkingLoaderProps {
  message?: string;
  showFacts?: boolean;
}

export function AIThinkingLoader({ 
  message = "Generating AI-powered insights...",
  showFacts = true 
}: AIThinkingLoaderProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!showFacts) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentFactIndex((prev) => (prev + 1) % investmentFacts.length);
        setIsVisible(true);
      }, 150); // Fade out duration
    }, 2500); // Change every 2.5 seconds

    return () => clearInterval(interval);
  }, [showFacts]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Animated Brain Icon */}
      <div className="relative mb-6">
        {/* Pulsing background circles */}
        <div className="absolute inset-0 animate-ping-slow">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20"></div>
        </div>
        <div className="absolute inset-0 animate-pulse">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-30"></div>
        </div>
        
        {/* Main icon */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl animate-float">
          <Brain className="w-12 h-12 text-white animate-pulse" />
        </div>

        {/* Orbiting sparkles */}
        <div className="absolute inset-0 animate-spin-slow">
          <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 text-indigo-500" />
        </div>
        <div className="absolute inset-0 animate-spin-slow-reverse">
          <TrendingUp className="absolute bottom-0 right-0 w-5 h-5 text-purple-500" />
        </div>
      </div>

      {/* Main Message */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-text-primary mb-2">
          {message}
        </h3>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Rotating Facts */}
      {showFacts && (
        <div className="min-h-[40px] flex items-center justify-center">
          <p 
            className={`text-sm font-medium text-text-secondary transition-all duration-150 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            {investmentFacts[currentFactIndex]}
          </p>
        </div>
      )}

      {/* Progress Indicators */}
      <div className="mt-6 flex items-center space-x-2">
        <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
        <BarChart3 className="w-4 h-4 text-purple-500 animate-pulse" style={{ animationDelay: '200ms' }} />
        <TrendingUp className="w-4 h-4 text-pink-500 animate-pulse" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
}
