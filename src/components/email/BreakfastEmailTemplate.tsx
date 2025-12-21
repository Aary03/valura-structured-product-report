/**
 * Valura Breakfast Email Template
 * Beautiful HTML email with inline styles for maximum compatibility
 */

import type { ValuraBreakfastDigest, ProcessedNewsArticle } from '../../services/newsAggregator';
import { formatTimeAgo, getSentimentLabel } from '../../services/newsAggregator';

interface EmailTemplateProps {
  digest: ValuraBreakfastDigest;
  recipientEmail?: string;
}

export function generateBreakfastEmailHTML(digest: ValuraBreakfastDigest, recipientEmail?: string): string {
  const date = new Date(digest.timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sentimentEmoji = digest.overallSentiment === 'bullish' ? '📈' : digest.overallSentiment === 'bearish' ? '📉' : '➡️';
  
  // Top news articles (limit to 5 for email)
  const topNews = [...digest.underlyingNews, ...digest.marketNews].slice(0, 5);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Valura Breakfast - ${date}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px 24px; text-align: center;">
        <div style="font-size: 36px; margin-bottom: 8px;">☕</div>
        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
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

    <!-- Market Pulse -->
    <tr>
      <td style="padding: 24px;">
        <div style="background: linear-gradient(135deg, ${
          digest.overallSentiment === 'bullish'
            ? '#d1fae5, #a7f3d0'
            : digest.overallSentiment === 'bearish'
              ? '#fee2e2, #fecaca'
              : '#f3f4f6, #e5e7eb'
        }); border-radius: 12px; padding: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="font-size: 28px; margin-right: 12px;">${sentimentEmoji}</span>
            <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #1f2937;">
              Today's Market Pulse
            </h2>
          </div>
          <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1f2937;">
            ${digest.marketPulse.vibe}
          </p>
          <p style="margin: 0; font-size: 14px; color: #6b7280; font-style: italic;">
            ${digest.marketPulse.description}
          </p>
        </div>
      </td>
    </tr>

    <!-- Trending Entities -->
    ${
      digest.marketPulse.topMovers.length > 0
        ? `
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1f2937; text-transform: uppercase; letter-spacing: 0.5px; font-size: 12px; color: #6b7280;">
          Trending Now
        </h3>
        ${digest.marketPulse.topMovers
          .map(
            (mover) => `
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-family: 'Courier New', monospace; font-weight: 700; font-size: 14px; color: #1f2937;">
                  ${mover.symbol}
                </span>
                <span style="font-size: 12px; color: #6b7280; margin-left: 8px;">
                  ${mover.name}
                </span>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 11px; color: #9ca3af; margin-bottom: 2px;">
                  ${mover.mentions} mentions
                </div>
                <span style="font-size: 20px;">
                  ${mover.direction === 'up' ? '↗' : mover.direction === 'down' ? '↘' : '→'}
                </span>
              </div>
            </div>
          </div>
        `
          )
          .join('')}
      </td>
    </tr>
    `
        : ''
    }

    <!-- Top News -->
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937;">
          Fresh Brews & Market Moves
        </h3>
        ${topNews
          .map(
            (article) => `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #ffffff;">
            <div style="margin-bottom: 8px;">
              <span style="display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; ${
                article.sentimentCategory === 'bullish'
                  ? 'background-color: #d1fae5; color: #065f46;'
                  : article.sentimentCategory === 'bearish'
                    ? 'background-color: #fee2e2; color: #991b1b;'
                    : 'background-color: #f3f4f6; color: #4b5563;'
              }">
                ${getSentimentLabel(article.sentimentCategory)}
              </span>
              <span style="font-size: 11px; color: #9ca3af; margin-left: 8px;">
                ${article.source} · ${formatTimeAgo(article.published_at)}
              </span>
            </div>
            <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #1f2937; line-height: 1.4;">
              <a href="${article.url}" style="color: #1f2937; text-decoration: none;" target="_blank">
                ${article.sophisticatedHeadline || article.title}
              </a>
            </h4>
            ${
              article.snippet
                ? `
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
              ${article.snippet.substring(0, 150)}${article.snippet.length > 150 ? '...' : ''}
            </p>
            `
                : ''
            }
            ${
              article.entities.length > 0
                ? `
            <div style="margin-top: 8px;">
              ${article.entities
                .slice(0, 3)
                .map(
                  (entity) => `
                <span style="display: inline-block; padding: 4px 8px; margin-right: 4px; margin-bottom: 4px; border-radius: 6px; font-size: 11px; font-family: 'Courier New', monospace; font-weight: 600; ${
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
            <div style="margin-top: 12px;">
              <a href="${article.url}" target="_blank" style="font-size: 12px; color: #3b82f6; text-decoration: none; font-weight: 600;">
                Read full story →
              </a>
            </div>
          </div>
        `
          )
          .join('')}
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-align: center;">
          Powered by <strong>Valura</strong> · Market data from Marketaux
        </p>
        <p style="margin: 0; font-size: 11px; color: #9ca3af; text-align: center; font-style: italic;">
          News and sentiment data is for informational purposes only. Not investment advice.
        </p>
        ${
          recipientEmail
            ? `
        <p style="margin: 16px 0 0 0; font-size: 11px; color: #9ca3af; text-align: center;">
          Sent to ${recipientEmail}
        </p>
        `
            : ''
        }
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
export function BreakfastEmailTemplate({ digest, recipientEmail }: EmailTemplateProps) {
  return <div dangerouslySetInnerHTML={{ __html: generateBreakfastEmailHTML(digest, recipientEmail) }} />;
}

