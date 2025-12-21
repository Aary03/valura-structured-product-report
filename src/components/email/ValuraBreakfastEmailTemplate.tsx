/**
 * Valura Breakfast Email Template - Premium Edition
 * Beautiful, responsive HTML email with inline styles
 */

import type { ProcessedNewsArticle } from '../../services/newsAggregator';
import { formatTimeAgo } from '../../services/newsAggregator';

export interface BreakfastEmailData {
  bullishNews: ProcessedNewsArticle[];
  bearishNews: ProcessedNewsArticle[];
  techNews: ProcessedNewsArticle[];
  financeNews: ProcessedNewsArticle[];
  marketVibe: 'Bullish' | 'Bearish' | 'Mixed';
  bullishRatio: number;
  timestamp: string;
  recipientEmail?: string;
}

export function generateValuraBreakfastEmail(data: BreakfastEmailData): string {
  const date = new Date(data.timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const vibeEmoji = data.marketVibe === 'Bullish' ? '📈' : data.marketVibe === 'Bearish' ? '📉' : '➡️';
  const vibeColor = data.marketVibe === 'Bullish' ? '#10b981' : data.marketVibe === 'Bearish' ? '#ef4444' : '#6b7280';

  const renderNewsSection = (articles: ProcessedNewsArticle[], title: string, emoji: string, color: string) => {
    if (articles.length === 0) return '';
    
    return `
      <tr>
        <td style="padding: 32px 24px 0 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #1f2937; display: flex; align-items: center;">
            <span style="font-size: 28px; margin-right: 8px;">${emoji}</span>
            ${title}
          </h2>
        </td>
      </tr>
      ${articles.slice(0, 5).map(article => `
        <tr>
          <td style="padding: 0 24px 16px 24px;">
            <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <tr>
                <td style="padding: 16px;">
                  ${article.image_url ? `
                    <div style="margin-bottom: 12px;">
                      <img src="${article.image_url}" alt="" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; display: block;" />
                    </div>
                  ` : ''}
                  
                  <div style="margin-bottom: 8px;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background-color: ${color}20; color: ${color};">
                      ${article.sentimentCategory === 'bullish' ? 'Brewing Upside ↗' : article.sentimentCategory === 'bearish' ? 'Bears Stirring ↘' : 'Flat White Markets'}
                    </span>
                    <span style="font-size: 11px; color: #9ca3af; margin-left: 8px;">
                      ${article.source} · ${formatTimeAgo(article.published_at)}
                    </span>
                  </div>
                  
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937; line-height: 1.4;">
                    <a href="${article.url}" style="color: #1f2937; text-decoration: none;" target="_blank">
                      ${article.title}
                    </a>
                  </h3>
                  
                  ${article.snippet ? `
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                      ${article.snippet.substring(0, 150)}${article.snippet.length > 150 ? '...' : ''}
                    </p>
                  ` : ''}
                  
                  ${article.entities.length > 0 ? `
                    <div style="margin-top: 12px;">
                      ${article.entities.slice(0, 3).map(entity => `
                        <span style="display: inline-block; padding: 4px 8px; margin-right: 6px; margin-bottom: 4px; border-radius: 6px; font-size: 11px; font-family: 'Courier New', monospace; font-weight: 600; background-color: ${
                          entity.sentiment_score > 0.1 ? '#d1fae5' : entity.sentiment_score < -0.1 ? '#fee2e2' : '#f3f4f6'
                        }; color: ${
                          entity.sentiment_score > 0.1 ? '#065f46' : entity.sentiment_score < -0.1 ? '#991b1b' : '#4b5563'
                        };">
                          ${entity.symbol}${entity.sentiment_score !== 0 ? (entity.sentiment_score > 0 ? ' ↗' : ' ↘') : ''}
                        </span>
                      `).join('')}
                    </div>
                  ` : ''}
                  
                  <div style="margin-top: 12px;">
                    <a href="${article.url}" target="_blank" style="font-size: 12px; color: ${color}; text-decoration: none; font-weight: 600;">
                      Read full story →
                    </a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `).join('')}
    `;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Valura Breakfast - ${date}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f9fafb; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Hero Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%); padding: 40px 24px; text-align: center; position: relative;">
        <div style="font-size: 48px; margin-bottom: 12px; animation: bounce 3s ease-in-out infinite;">☕</div>
        <h1 style="margin: 0; font-size: 36px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          Valura Breakfast
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 16px; color: rgba(255,255,255,0.95); font-style: italic; font-weight: 500;">
          Fresh Market Intel, Served Daily
        </p>
        <p style="margin: 16px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.85);">
          ${date}
        </p>
      </td>
    </tr>

    <!-- Market Vibe Gauge -->
    <tr>
      <td style="padding: 32px 24px; background: linear-gradient(135deg, ${vibeColor}15 0%, ${vibeColor}05 100%); border-bottom: 3px solid ${vibeColor};">
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="text-align: center;">
              <div style="font-size: 64px; margin-bottom: 8px;">${vibeEmoji}</div>
              <h2 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; color: ${vibeColor};">
                Today's Market: ${data.marketVibe}
              </h2>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                ${data.bullishNews.length + data.bearishNews.length + data.techNews.length + data.financeNews.length} articles analyzed
              </p>
              
              <!-- Sentiment Bar -->
              <div style="width: 100%; max-width: 400px; height: 8px; background-color: rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden; margin: 16px auto 8px auto;">
                <div style="height: 100%; width: ${data.bullishRatio}%; background: linear-gradient(90deg, #10b981 0%, #34d399 100%); transition: width 1s ease;"></div>
              </div>
              <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">
                <span style="float: left;">Bearish</span>
                <span style="float: right;">Bullish</span>
                <div style="clear: both;"></div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Quick Stats Cards -->
    <tr>
      <td style="padding: 32px 24px; background-color: #f9fafb;">
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td width="48%" style="padding: 0 8px 8px 0;">
              <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 1px solid #6ee7b7; border-radius: 12px; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-size: 32px; margin-bottom: 4px;">📈</div>
                    <div style="font-size: 28px; font-weight: 700; color: #065f46; margin-bottom: 4px;">${data.bullishNews.length}</div>
                    <div style="font-size: 12px; font-weight: 600; color: #065f46;">Bullish Stories</div>
                    <div style="font-size: 10px; color: #047857; margin-top: 2px;">Positive sentiment</div>
                  </td>
                </tr>
              </table>
            </td>
            <td width="48%" style="padding: 0 0 8px 8px;">
              <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 1px solid #fca5a5; border-radius: 12px; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-size: 32px; margin-bottom: 4px;">📉</div>
                    <div style="font-size: 28px; font-weight: 700; color: #991b1b; margin-bottom: 4px;">${data.bearishNews.length}</div>
                    <div style="font-size: 12px; font-weight: 600; color: #991b1b;">Bearish Stories</div>
                    <div style="font-size: 10px; color: #b91c1c; margin-top: 2px;">Negative sentiment</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td width="48%" style="padding: 8px 8px 0 0;">
              <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 1px solid #93c5fd; border-radius: 12px; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-size: 32px; margin-bottom: 4px;">💻</div>
                    <div style="font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">${data.techNews.length}</div>
                    <div style="font-size: 12px; font-weight: 600; color: #1e40af;">Tech News</div>
                    <div style="font-size: 10px; color: #2563eb; margin-top: 2px;">Technology sector</div>
                  </td>
                </tr>
              </table>
            </td>
            <td width="48%" style="padding: 8px 0 0 8px;">
              <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%); border: 1px solid #c084fc; border-radius: 12px; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-size: 32px; margin-bottom: 4px;">💰</div>
                    <div style="font-size: 28px; font-weight: 700; color: #6b21a8; margin-bottom: 4px;">${data.financeNews.length}</div>
                    <div style="font-size: 12px; font-weight: 600; color: #6b21a8;">Finance News</div>
                    <div style="font-size: 10px; color: #7c3aed; margin-top: 2px;">Financial services</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${renderNewsSection(data.bullishNews, 'Bulls Are Feasting', '📈', '#10b981')}
    
    ${renderNewsSection(data.bearishNews, 'Bears Prowling', '📉', '#ef4444')}
    
    ${renderNewsSection(data.techNews, 'Technology Sector', '💻', '#3b82f6')}
    
    ${renderNewsSection(data.financeNews, 'Financial Services', '💰', '#8b5cf6')}

    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 32px 24px; border-top: 1px solid #e5e7eb;">
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                <strong style="color: #1f2937;">Powered by Valura</strong> · Market data from <a href="https://www.marketaux.com" target="_blank" style="color: #3b82f6; text-decoration: none;">Marketaux</a>
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ca3af; font-style: italic;">
                News and sentiment data is for informational purposes only. Not investment advice.
              </p>
              ${data.recipientEmail ? `
                <p style="margin: 16px 0 0 0; font-size: 11px; color: #9ca3af;">
                  Sent to ${data.recipientEmail}
                </p>
              ` : ''}
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <a href="#" style="font-size: 11px; color: #9ca3af; text-decoration: none; margin: 0 8px;">View in Browser</a>
                <span style="color: #e5e7eb;">|</span>
                <a href="#" style="font-size: 11px; color: #9ca3af; text-decoration: none; margin: 0 8px;">Unsubscribe</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
</body>
</html>
  `.trim();
}

/**
 * React component version (for preview)
 */
export function ValuraBreakfastEmailTemplate({ data }: { data: BreakfastEmailData }) {
  return <div dangerouslySetInnerHTML={{ __html: generateValuraBreakfastEmail(data) }} />;
}

