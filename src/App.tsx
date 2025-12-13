/**
 * Main App Component
 * Handles form input and report display
 */

import { useState } from 'react';
import { ProductInputForm } from './components/input/ProductInputForm';
import { ReverseConvertibleReport } from './components/report/ReverseConvertibleReport';
import { useReportGenerator } from './hooks/useReportGenerator';
import type { ReverseConvertibleTerms } from './products/reverseConvertible/terms';
import { APITestComponent } from './test-api-component';
import './styles/globals.css';
import './styles/theme.css';

// TEMPORARY: Set to true to test API, false for normal app
const TEST_API_MODE = false;

function App() {
  // TEMPORARY: Show API test component
  if (TEST_API_MODE) {
    return <APITestComponent />;
  }
  const { reportData, loading, error, generateReport, clearReport } = useReportGenerator();
  const [showReport, setShowReport] = useState(false);

  const handleFormSubmit = async (terms: ReverseConvertibleTerms) => {
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
              <h1 className="text-3xl font-bold text-blue-primary">
                Reverse Convertible Report Generator
              </h1>
              <p className="text-grey-medium mt-2">
                Generate professional term sheet reports for Reverse Convertible products
              </p>
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
              <button
                onClick={handleBackToInput}
                className="btn-secondary no-print"
              >
                ← Back to Input
              </button>
            </div>
          </div>

          {/* Report */}
          {reportData ? (
            <ReverseConvertibleReport reportData={reportData} />
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

