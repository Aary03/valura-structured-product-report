/**
 * Test News API - Debug Component
 * Tests Marketaux API directly in the browser
 */

import { useState } from 'react';
import { fetchMarketNews, fetchMarketStats } from './services/api/marketaux';

export function TestNewsAPI() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testNewsAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing Marketaux API...');
      const response = await fetchMarketNews({
        symbols: ['AAPL'],
        limit: 2,
        language: 'en',
      });
      console.log('Success!', response);
      setResult(response);
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testTrendingAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing Market Stats API (for trending)...');
      // Using stats endpoint since trending endpoint is not available in free tier
      const response = await fetchMarketStats({
        groupBy: 'symbol',
        sort: 'mentions',
        sortOrder: 'desc',
        limit: 5,
        countries: ['us'],
      });
      console.log('Success!', response);
      setResult(response);
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Marketaux API Test
      </h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={testNewsAPI}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          Test News API
        </button>

        <button
          onClick={testTrendingAPI}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          Test Market Stats (Trending)
        </button>
      </div>

      {loading && (
        <div style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
          Loading...
        </div>
      )}

      {error && (
        <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
          <strong>Error:</strong> {error}
          <details style={{ marginTop: '10px' }}>
            <summary>Details</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>{error}</pre>
          </details>
        </div>
      )}

      {result && (
        <div style={{ padding: '20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px' }}>
          <strong>Success!</strong>
          <details style={{ marginTop: '10px' }}>
            <summary>Response Data</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
          Instructions:
        </h2>
        <ol style={{ paddingLeft: '20px' }}>
          <li>Click "Test News API" to test fetching news for AAPL</li>
          <li>Check the browser console (F12) for detailed logs</li>
          <li>If you see CORS errors, the API needs a proxy or backend integration</li>
          <li>If successful, Valura Breakfast should work!</li>
        </ol>
      </div>
    </div>
  );
}

