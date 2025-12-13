/**
 * Temporary API Test File
 * Run this to verify the Financial Modeling Prep API is working correctly
 * 
 * To run: npx tsx src/test-api.ts
 * Or: node --loader ts-node/esm src/test-api.ts
 */

import { fmpClient } from './services/api/financialModelingPrep';
import type { FMPQuote, FMPPriceTarget, FMPRatings, FMPHistoricalResponse } from './services/api/mappers';

async function testAPI() {
  console.log('🧪 Testing Financial Modeling Prep API...\n');
  
  const testSymbol = 'AAPL';
  
  try {
    // Test 1: Get Quote
    console.log('1️⃣ Testing Quote API...');
    const quoteUrl = fmpClient.quote.quote(testSymbol);
    console.log('   URL:', quoteUrl);
    
    const quote = await fmpClient.get<FMPQuote[]>(quoteUrl);
    const quoteData = Array.isArray(quote) ? quote[0] : quote;
    
    if (quoteData && quoteData.symbol) {
      console.log('   ✅ Quote Success!');
      console.log('   Symbol:', quoteData.symbol);
      console.log('   Name:', quoteData.name);
      console.log('   Price: $', quoteData.price);
      console.log('   Change:', quoteData.change, `(${quoteData.changesPercentage}%)`);
    } else {
      console.log('   ❌ Quote failed - invalid response');
      console.log('   Response:', quote);
    }
    
    console.log('\n');
    
    // Test 2: Get Price Target
    console.log('2️⃣ Testing Price Target API...');
    try {
      const priceTargetUrl = fmpClient.analyst.priceTargetConsensus(testSymbol);
      const priceTarget = await fmpClient.get<FMPPriceTarget>(priceTargetUrl);
      
      if (priceTarget && priceTarget.targetMean) {
        console.log('   ✅ Price Target Success!');
        console.log('   Target Mean: $', priceTarget.targetMean);
        console.log('   Target High: $', priceTarget.targetHigh);
        console.log('   Target Low: $', priceTarget.targetLow);
        console.log('   Analysts:', priceTarget.numberOfAnalysts);
      } else {
        console.log('   ⚠️  Price Target - no data available');
      }
    } catch (error) {
      console.log('   ⚠️  Price Target failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    console.log('\n');
    
    // Test 3: Get Ratings
    console.log('3️⃣ Testing Ratings API...');
    try {
      const ratingsUrl = fmpClient.analyst.ratingsSnapshot(testSymbol);
      const ratings = await fmpClient.get<FMPRatings>(ratingsUrl);
      
      if (ratings && ratings.rating) {
        console.log('   ✅ Ratings Success!');
        console.log('   Rating:', ratings.rating);
        console.log('   Recommendation:', ratings.ratingRecommendation);
      } else {
        console.log('   ⚠️  Ratings - no data available');
      }
    } catch (error) {
      console.log('   ⚠️  Ratings failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    console.log('\n');
    
    // Test 4: Get Historical Prices (last 30 days)
    console.log('4️⃣ Testing Historical Prices API...');
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      
      const historicalUrl = fmpClient.historicalPrice.historicalPriceEodFull(testSymbol, startDate, endDate);
      console.log('   Fetching from', startDate, 'to', endDate);
      
      const historical = await fmpClient.get<FMPHistoricalResponse>(historicalUrl);
      
      if (historical && historical.historical && historical.historical.length > 0) {
        console.log('   ✅ Historical Prices Success!');
        console.log('   Data points:', historical.historical.length);
        console.log('   Latest date:', historical.historical[0].date);
        console.log('   Latest close: $', historical.historical[0].close);
        console.log('   Oldest date:', historical.historical[historical.historical.length - 1].date);
      } else {
        console.log('   ⚠️  Historical Prices - no data available');
      }
    } catch (error) {
      console.log('   ⚠️  Historical Prices failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    console.log('\n');
    console.log('✅ API Test Complete!');
    
  } catch (error) {
    console.error('❌ API Test Failed!');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testAPI();

