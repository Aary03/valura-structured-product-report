/**
 * Valura Breakfast - Standalone News Page
 * Full-screen financial news digest experience
 */

import { useState } from 'react';
import { ValuraBreakfastEnhanced } from '../news/ValuraBreakfastEnhanced';
import { sendBreakfastEmail } from '../../services/email/breakfastEmail';

export function NewsPage() {
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleEmailDigest = async (digest: any) => {
    setEmailStatus('sending');
    setEmailError(null);

    try {
      await sendBreakfastEmail(digest);
      setEmailStatus('success');
      setTimeout(() => setEmailStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to send email:', error);
      setEmailError(error instanceof Error ? error.message : 'Failed to send email');
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 5000);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-grad)' }}>
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="text-2xl font-bold text-valura-ink hover:opacity-80 transition-opacity"
              >
                Valura
              </a>
              <span className="text-muted">|</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">☕</span>
                <span className="text-lg font-semibold text-text-primary">Breakfast</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm text-muted hover:text-text-primary transition-colors"
              >
                ← Back to Reports
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {emailStatus === 'sending' && (
        <div className="fixed top-20 right-6 z-50 bg-surface border border-border rounded-lg shadow-strong p-4 animate-slide-in">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-valura-ink border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-text-primary">Sending email...</span>
          </div>
        </div>
      )}

      {emailStatus === 'success' && (
        <div className="fixed top-20 right-6 z-50 bg-success-bg border border-success-fg rounded-lg shadow-strong p-4 animate-slide-in">
          <div className="flex items-center gap-3">
            <span className="text-xl">✓</span>
            <span className="text-sm font-medium text-success-fg">Email sent successfully!</span>
          </div>
        </div>
      )}

      {emailStatus === 'error' && (
        <div className="fixed top-20 right-6 z-50 bg-danger-bg border border-danger-fg rounded-lg shadow-strong p-4 animate-slide-in max-w-sm">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="text-sm font-medium text-danger-fg mb-1">Failed to send email</div>
              {emailError && <div className="text-xs text-muted">{emailError}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <ValuraBreakfastEnhanced onEmailClick={handleEmailDigest} />

      {/* Footer */}
      <div className="border-t border-border bg-surface/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted">
            <p className="mb-2">
              Market data powered by{' '}
              <a
                href="https://www.marketaux.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-valura-ink hover:underline"
              >
                Marketaux
              </a>
            </p>
            <p className="text-xs">
              News and sentiment data is for informational purposes only. Not investment advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

