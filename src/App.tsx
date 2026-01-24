/**
 * Main App Component
 * Handles form input and report display
 */

import { useState, useEffect } from 'react';
import { ProductInputForm } from './components/input/ProductInputForm';
import { ReverseConvertibleReport } from './components/report/ReverseConvertibleReport';
import { CapitalProtectedParticipationReport } from './components/report/CapitalProtectedParticipationReport';
import { NewsPage } from './components/pages/NewsPage';
import { AIReportBuilder } from './pages/AIReportBuilder';
import { PositionTrackerPage } from './pages/PositionTrackerPage';
import { LifecyclePage } from './pages/LifecyclePage';
import { useReportGenerator } from './hooks/useReportGenerator';
import type { ProductTerms } from './hooks/useReportGenerator';
import { APITestComponent } from './test-api-component';
import { TestNewsAPI } from './test-news-api';
import { PdfReport } from './components/pdf/PdfReport';
import './styles/globals.css';
import './styles/theme.css';

// TEMPORARY: Set to true to test API, false for normal app
const TEST_API_MODE = false;
const TEST_NEWS_API_MODE = false; // Set to false for normal app, true to test Marketaux API

type RouteType = 'home' | 'breakfast' | 'ai-builder' | 'tracker' | 'lifecycle';

function App() {
  const isPdf = new URLSearchParams(window.location.search).get('pdf') === '1';
  const [currentRoute, setCurrentRoute] = useState<RouteType>('home');
  
  // IMPORTANT: All hooks must be called before any early returns (Rules of Hooks)
  const { reportData, loading, error, generateReport, clearReport } = useReportGenerator();
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    // Simple routing based on hash
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove #
      if (hash === 'breakfast') {
        setCurrentRoute('breakfast');
      } else if (hash === 'ai-builder') {
        setCurrentRoute('ai-builder');
      } else if (hash === 'tracker') {
        setCurrentRoute('tracker');
      } else if (hash === 'lifecycle') {
        setCurrentRoute('lifecycle');
      } else {
        setCurrentRoute('home');
      }
    };

    handleHashChange(); // Check initial hash
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // TEMPORARY: Show API test component
  if (TEST_API_MODE) {
    return <APITestComponent />;
  }

  // TEMPORARY: Show News API test component
  if (TEST_NEWS_API_MODE) {
    return <TestNewsAPI />;
  }

  // PDF-only layout: renders only the 2-page PDF design (no nav, no buttons)
  if (isPdf) {
    return <PdfReport />;
  }

  // Route to Valura Breakfast news page
  if (currentRoute === 'breakfast') {
    return <NewsPage />;
  }

  // Route to AI Report Builder
  if (currentRoute === 'ai-builder') {
    return <AIReportBuilder />;
  }

  // Route to Position Tracker
  if (currentRoute === 'tracker') {
    return <PositionTrackerPage />;
  }

  // Route to Lifecycle Page
  if (currentRoute === 'lifecycle') {
    return <LifecyclePage />;
  }

  const handleFormSubmit = async (terms: ProductTerms) => {
    await generateReport(terms);
    setShowReport(true);
  };

  const handleBackToInput = () => {
    setShowReport(false);
    clearReport();
  };

  return (
    <div className="min-h-screen bg-grey-background">
      {!showReport ? (
        <div>
          <div className="bg-white border-b border-grey-border py-4 mb-8">
            <div className="max-w-7xl mx-auto px-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-blue-primary">
                    Structured Product Report Generator
                  </h1>
                  <p className="text-grey-medium mt-2">
                    Generate professional term sheet reports for Reverse Convertibles and Participation Notes
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* AI Mode Toggle */}
                  <a
                    href="#ai-builder"
                    className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <span className="font-semibold">AI Mode</span>
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  </a>
                  
                  <a
                    href="#tracker"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors shadow-md"
                  >
                    <span>📊</span>
                    <span className="font-medium">Track Investments</span>
                  </a>
                  
                  <a
                    href="#lifecycle"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-colors shadow-md"
                  >
                    <span>🔄</span>
                    <span className="font-medium">Lifecycle</span>
                  </a>
                  
                  <a
                    href="#breakfast"
                    className="flex items-center gap-2 px-5 py-2.5 bg-valura-ink text-white rounded-lg hover:bg-valura-ink/90 transition-colors shadow-md"
                  >
                    <span>☕</span>
                    <span className="font-medium">Valura Breakfast</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <ProductInputForm onSubmit={handleFormSubmit} loading={loading} />
          {error && (
            <div className="max-w-4xl mx-auto px-8">
              <div className="bg-red-negative/10 border border-red-negative rounded-md p-4 mt-4">
                <p className="text-red-negative">Error: {error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Back Button */}
          <div className="bg-white border-b border-grey-border py-4 mb-4">
            <div className="max-w-7xl mx-auto px-8">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBackToInput}
                  className="btn-secondary no-print"
                >
                  ← Back to Input
                </button>
                <a
                  href="#breakfast"
                  className="flex items-center gap-2 px-4 py-2 bg-valura-ink text-white rounded-lg hover:bg-valura-ink/90 transition-colors text-sm no-print"
                >
                  <span>☕</span>
                  <span className="font-medium">Valura Breakfast</span>
                </a>
              </div>
            </div>
          </div>

          {/* Report */}
          {reportData ? (
            reportData.productType === 'RC' ? (
              <ReverseConvertibleReport reportData={reportData} />
            ) : (
              <CapitalProtectedParticipationReport reportData={reportData} />
            )
          ) : loading ? (
            <div className="max-w-7xl mx-auto p-8">
              <div className="section-card text-center py-12">
                <div className="text-grey-medium">Generating report...</div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto p-8">
              <div className="section-card text-center py-12">
                <div className="text-red-negative">Failed to generate report</div>
                {error && <p className="text-grey-medium mt-2">{error}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

