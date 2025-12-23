/**
 * Valura Breakfast Email Template - Enhanced Version
 * Beautiful HTML email with market digest sections
 */

import type { ProcessedNewsArticle } from '../../services/newsAggregator';
import { formatTimeAgo, getSentimentLabel } from '../../services/newsAggregator';

export interface BreakfastEmailData {
  bullishNews: ProcessedNewsArticle[];
  bearishNews: ProcessedNewsArticle[];
  techNews: ProcessedNewsArticle[];
  financeNews: ProcessedNewsArticle[];
  marketVibe: 'Bullish' | 'Bearish' | 'Mixed';
  bullishRatio: number; // 0-100
  timestamp: string;
  recipientEmail?: string;
}

interface EmailSection {
  title: string;
  emoji: string;
  articles: ProcessedNewsArticle[];
  bgGradient: string;
}

export function generateValuraBreakfastEmail(data: BreakfastEmailData): string {
  const date = new Date(data.timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const vibeEmoji = data.marketVibe === 'Bullish' ? '📈' : data.marketVibe === 'Bearish' ? '📉' : '➡️';
  const totalArticles = data.bullishNews.length + data.bearishNews.length + data.techNews.length + data.financeNews.length;

  // Market vibe gradient
  const vibeGradient =
    data.marketVibe === 'Bullish'
      ? '#d1fae5, #a7f3d0'
      : data.marketVibe === 'Bearish'
        ? '#fee2e2, #fecaca'
        : '#f3f4f6, #e5e7eb';

  // Sections to render (only show if has articles)
  const sections: EmailSection[] = [
    {
      title: 'Bulls Are Feasting',
      emoji: '📈',
      articles: data.bullishNews.slice(0, 5),
      bgGradient: '#d1fae5',
    },
    {
      title: 'Bears Prowling',
      emoji: '📉',
      articles: data.bearishNews.slice(0, 5),
      bgGradient: '#fee2e2',
    },
    {
      title: 'Technology Sector',
      emoji: '💻',
      articles: data.techNews.slice(0, 5),
      bgGradient: '#dbeafe',
    },
    {
      title: 'Financial Services',
      emoji: '💰',
      articles: data.financeNews.slice(0, 5),
      bgGradient: '#e9d5ff',
    },
  ].filter((section) => section.articles.length > 0);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Valura Breakfast - ${date}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 680px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Hero Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%); padding: 40px 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 12px; animation: bounce 2s ease-in-out infinite;">☕</div>
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
          Valura Breakfast
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9); font-style: italic;">
          Fresh Market Intel, Served Daily
        </p>
        <p style="margin: 16px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.8);">
          ${date}
        </p>
      </td>
    </tr>

    <!-- Market Vibe Gauge -->
    <tr>
      <td style="padding: 32px 24px; text-align: center; background: linear-gradient(135deg, ${vibeGradient});">
        <div style="font-size: 64px; margin-bottom: 12px;">${vibeEmoji}</div>
        <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #1f2937;">
          Today's Market: ${data.marketVibe}
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
          ${totalArticles} articles analyzed
        </p>
        
        <!-- Sentiment Bar -->
        <div style="max-width: 400px; margin: 0 auto;">
          <div style="background-color: #e5e7eb; border-radius: 12px; height: 24px; overflow: hidden; position: relative;">
            <div style="background: linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%); height: 100%; width: ${data.bullishRatio}%; transition: width 0.5s ease;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: #6b7280;">
            <span>Bearish</span>
            <span>Bullish</span>
          </div>
        </div>
      </td>
    </tr>

    <!-- Quick Stats Grid -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="width: 48%; padding-right: 2%;">
              <div style="background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">📈</div>
                <div style="font-size: 28px; font-weight: 700; color: #065f46; margin-bottom: 4px;">${data.bullishNews.length}</div>
                <div style="font-size: 12px; font-weight: 600; color: #065f46; margin-bottom: 4px;">Bullish</div>
                <div style="font-size: 11px; color: #059669;">Positive Stories</div>
              </div>
            </td>
            <td style="width: 48%; padding-left: 2%;">
              <div style="background: linear-gradient(135deg, #fee2e2, #fecaca); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">📉</div>
                <div style="font-size: 28px; font-weight: 700; color: #991b1b; margin-bottom: 4px;">${data.bearishNews.length}</div>
                <div style="font-size: 12px; font-weight: 600; color: #991b1b; margin-bottom: 4px;">Bearish</div>
                <div style="font-size: 11px; color: #dc2626;">Negative Stories</div>
              </div>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="height: 12px;"></td>
          </tr>
          <tr>
            <td style="width: 48%; padding-right: 2%;">
              <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">💻</div>
                <div style="font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 4px;">${data.techNews.length}</div>
                <div style="font-size: 12px; font-weight: 600; color: #1e40af; margin-bottom: 4px;">Tech</div>
                <div style="font-size: 11px; color: #2563eb;">Technology Sector</div>
              </div>
            </td>
            <td style="width: 48%; padding-left: 2%;">
              <div style="background: linear-gradient(135deg, #e9d5ff, #d8b4fe); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">💰</div>
                <div style="font-size: 28px; font-weight: 700; color: #6b21a8; margin-bottom: 4px;">${data.financeNews.length}</div>
                <div style="font-size: 12px; font-weight: 600; color: #6b21a8; margin-bottom: 4px;">Finance</div>
                <div style="font-size: 11px; color: #7c3aed;">Financial Services</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${sections
      .map(
        (section) => `
    <!-- ${section.title} Section -->
    <tr>
      <td style="padding: 0 24px 32px 24px;">
        <div style="background-color: ${section.bgGradient}; border-radius: 12px; padding: 16px 20px; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #1f2937;">
            <span style="font-size: 24px; margin-right: 8px;">${section.emoji}</span>
            ${section.title}
          </h3>
        </div>
        
        ${section.articles
          .map(
            (article) => `
        <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px; background: #ffffff;">
          ${
            article.image_url
              ? `
          <img src="${article.image_url}" alt="${article.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;" />
          `
              : ''
          }
          
          <div style="margin-bottom: 10px;">
            <span style="display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; ${
              article.sentimentCategory === 'bullish'
                ? 'background-color: #d1fae5; color: #065f46;'
                : article.sentimentCategory === 'bearish'
                  ? 'background-color: #fee2e2; color: #991b1b;'
                  : 'background-color: #f3f4f6; color: #4b5563;'
            }">
              ${getSentimentLabel(article.sentimentCategory)} ${
                article.sentimentCategory === 'bullish' ? '↗' : article.sentimentCategory === 'bearish' ? '↘' : '→'
              }
            </span>
            <span style="font-size: 12px; color: #9ca3af; margin-left: 8px;">
              ${article.source} · ${formatTimeAgo(article.published_at)}
            </span>
          </div>
          
          <h4 style="margin: 0 0 12px 0; font-size: 17px; font-weight: 600; color: #1f2937; line-height: 1.4;">
            <a href="${article.url}" style="color: #1f2937; text-decoration: none;" target="_blank" rel="noopener noreferrer">
              ${article.sophisticatedHeadline || article.title}
            </a>
          </h4>
          
          ${
            article.snippet
              ? `
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
            ${article.snippet.substring(0, 150)}${article.snippet.length > 150 ? '...' : ''}
          </p>
          `
              : ''
          }
          
          ${
            article.entities.length > 0
              ? `
          <div style="margin-bottom: 16px;">
            ${article.entities
              .slice(0, 4)
              .map(
                (entity) => `
            <span style="display: inline-block; padding: 6px 10px; margin-right: 6px; margin-bottom: 6px; border-radius: 8px; font-size: 12px; font-family: 'Courier New', monospace; font-weight: 600; ${
              entity.sentiment_score > 0.1
                ? 'background-color: #d1fae5; color: #065f46;'
                : entity.sentiment_score < -0.1
                  ? 'background-color: #fee2e2; color: #991b1b;'
                  : 'background-color: #f3f4f6; color: #4b5563;'
            }">
              ${entity.symbol}
              ${entity.sentiment_score !== 0 ? (entity.sentiment_score > 0 ? ' ↗' : ' ↘') : ''}
            </span>
            `
              )
              .join('')}
          </div>
          `
              : ''
          }
          
          <div>
            <a href="${article.url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600;">
              Read full story →
            </a>
          </div>
        </div>
        `
          )
          .join('')}
      </td>
    </tr>
    `
      )
      .join('')}

    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 32px 24px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; text-align: center;">
          Powered by <strong style="color: #1f2937;">Valura</strong> · Market data from <strong>Marketaux</strong>
        </p>
        <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ca3af; text-align: center; font-style: italic;">
          News and sentiment data is for informational purposes only. Not investment advice.
        </p>
        ${
          data.recipientEmail
            ? `
        <p style="margin: 0; font-size: 11px; color: #9ca3af; text-align: center;">
          Sent to ${data.recipientEmail}
        </p>
        `
            : ''
        }
        <div style="margin-top: 16px; text-align: center;">
          <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 11px; margin: 0 8px;">View in Browser</a>
          <span style="color: #d1d5db;">|</span>
          <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 11px; margin: 0 8px;">Unsubscribe</a>
        </div>
      </td>
    </tr>
    
  </table>
</body>
</html>
  `.trim();
}

/**
 * React component version (for preview/testing)
 */
export function ValuraBreakfastEmailTemplate({ emailData }: { emailData: BreakfastEmailData }) {
  return <div dangerouslySetInnerHTML={{ __html: generateValuraBreakfastEmail(emailData) }} />;
}
