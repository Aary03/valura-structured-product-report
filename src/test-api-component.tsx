/**
 * Temporary API Test Component
 * Add this to App.tsx temporarily to test API in browser
 */

import { useEffect, useState } from 'react';
import { fmpClient } from './services/api/financialModelingPrep';
import type { FMPQuote, FMPPriceTarget, FMPRatings, FMPHistoricalResponse, FMPHistoricalPrice } from './services/api/mappers';

export function APITestComponent() {
  const [results, setResults] = useState<string>('Testing API...\n');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testAPI() {
      const testSymbol = 'AAPL';
      let output = '🧪 Testing Financial Modeling Prep API...\n\n';

      try {
        // Test 1: Get Quote
        output += '1️⃣ Testing Quote API...\n';
        const quoteUrl = fmpClient.quote.quote(testSymbol);
        output += `   URL: ${quoteUrl}\n`;

        const quote = await fmpClient.get<FMPQuote[]>(quoteUrl);
        const quoteData = Array.isArray(quote) ? quote[0] : quote;

        if (quoteData && quoteData.symbol) {
          output += '   ✅ Quote Success!\n';
          output += `   Symbol: ${quoteData.symbol}\n`;
          output += `   Name: ${quoteData.name}\n`;
          output += `   Price: $${quoteData.price}\n`;
          output += `   Change: ${quoteData.change} (${quoteData.changesPercentage}%)\n`;
        } else {
          output += '   ❌ Quote failed - invalid response\n';
          output += `   Response: ${JSON.stringify(quote)}\n`;
        }

        output += '\n';

        // Test 2: Get Price Target
        output += '2️⃣ Testing Price Target API...\n';
        try {
          const priceTargetUrl = fmpClient.analyst.priceTargetConsensus(testSymbol);
          output += `   URL: ${priceTargetUrl}\n`;
          const priceTarget = await fmpClient.get<FMPPriceTarget>(priceTargetUrl);
          output += `   Raw Response: ${JSON.stringify(priceTarget).substring(0, 200)}...\n`;

          // Check if it's an array
          if (Array.isArray(priceTarget)) {
            if (priceTarget.length > 0) {
              const data = priceTarget[0];
              const targetValue = data.targetConsensus || (data as any).targetMean;
              if (data && targetValue) {
                output += '   ✅ Price Target Success!\n';
                output += `   Target Consensus: $${targetValue}\n`;
                output += `   Target High: $${data.targetHigh}\n`;
                output += `   Target Low: $${data.targetLow}\n`;
                output += `   Target Median: $${data.targetMedian}\n`;
              } else {
                output += '   ⚠️  Price Target - array but no valid data\n';
              }
            } else {
              output += '   ⚠️  Price Target - empty array\n';
            }
          } else if (priceTarget) {
            const targetValue = priceTarget.targetConsensus || (priceTarget as any).targetMean;
            if (targetValue) {
              output += '   ✅ Price Target Success!\n';
              output += `   Target Consensus: $${targetValue}\n`;
              output += `   Target High: $${priceTarget.targetHigh}\n`;
              output += `   Target Low: $${priceTarget.targetLow}\n`;
              output += `   Target Median: $${priceTarget.targetMedian}\n`;
            } else {
              output += '   ⚠️  Price Target - no valid data\n';
            }
          } else {
            output += '   ⚠️  Price Target - no data available\n';
          }
        } catch (error) {
          output += `   ❌ Price Target failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
          if (error instanceof Error && error.stack) {
            output += `   Stack: ${error.stack.substring(0, 200)}\n`;
          }
        }

        output += '\n';

        // Test 3: Get Ratings
        output += '3️⃣ Testing Ratings API...\n';
        try {
          const ratingsUrl = fmpClient.analyst.ratingsSnapshot(testSymbol);
          output += `   URL: ${ratingsUrl}\n`;
          const ratings = await fmpClient.get<FMPRatings>(ratingsUrl);
          output += `   Raw Response: ${JSON.stringify(ratings).substring(0, 200)}...\n`;

          // Check if it's an array
          if (Array.isArray(ratings)) {
            if (ratings.length > 0) {
              const data = ratings[0];
              if (data && data.rating) {
                output += '   ✅ Ratings Success!\n';
                output += `   Rating: ${data.rating}\n`;
                output += `   Recommendation: ${data.ratingRecommendation}\n`;
              } else {
                output += '   ⚠️  Ratings - array but no valid data\n';
              }
            } else {
              output += '   ⚠️  Ratings - empty array\n';
            }
          } else if (ratings && ratings.rating) {
            output += '   ✅ Ratings Success!\n';
            output += `   Rating: ${ratings.rating}\n`;
            output += `   Recommendation: ${ratings.ratingRecommendation}\n`;
          } else {
            output += '   ⚠️  Ratings - no data available\n';
          }
        } catch (error) {
          output += `   ❌ Ratings failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
          if (error instanceof Error && error.stack) {
            output += `   Stack: ${error.stack.substring(0, 200)}\n`;
          }
        }

        output += '\n';

        // Test 4: Get Historical Prices
        output += '4️⃣ Testing Historical Prices API...\n';
        try {
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];

          const historicalUrl = fmpClient.historicalPrice.historicalPriceEodFull(
            testSymbol,
            startDate,
            endDate
          );
          output += `   URL: ${historicalUrl}\n`;
          output += `   Fetching from ${startDate} to ${endDate}\n`;

          const historical = await fmpClient.get<FMPHistoricalResponse | FMPHistoricalPrice[]>(historicalUrl);
          output += `   Raw Response type: ${Array.isArray(historical) ? 'Array' : typeof historical}\n`;
          output += `   Raw Response preview: ${JSON.stringify(historical).substring(0, 300)}...\n`;

          // Handle both array format and object with historical property
          let historicalArray: FMPHistoricalPrice[] = [];
          if (Array.isArray(historical)) {
            historicalArray = historical;
          } else if (historical && 'historical' in historical && Array.isArray(historical.historical)) {
            historicalArray = historical.historical;
          }

          if (historicalArray.length > 0) {
            output += '   ✅ Historical Prices Success!\n';
            output += `   Data points: ${historicalArray.length}\n`;
            output += `   Latest date: ${historicalArray[0].date}\n`;
            output += `   Latest close: $${historicalArray[0].close}\n`;
            output += `   Oldest date: ${historicalArray[historicalArray.length - 1].date}\n`;
          } else {
            output += '   ⚠️  Historical Prices - no data available\n';
          }
        } catch (error) {
          output += `   ⚠️  Historical Prices failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
        }

        output += '\n✅ API Test Complete!';
      } catch (error) {
        output += '\n❌ API Test Failed!\n';
        output += `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`;
        if (error instanceof Error && error.stack) {
          output += `Stack: ${error.stack}\n`;
        }
      }

      setResults(output);
      setLoading(false);
    }

    testAPI();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="section-card">
        <h2 className="text-2xl font-bold mb-4">API Test Results</h2>
        <pre className="bg-grey-background p-4 rounded-md overflow-auto text-sm font-mono whitespace-pre-wrap">
          {loading ? 'Loading...' : results}
        </pre>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn-primary"
        >
          Retry Test
        </button>
      </div>
    </div>
  );
}

