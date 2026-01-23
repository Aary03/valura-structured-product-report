/**
 * Valura x Benzinga Breakfast Email
 * Beautiful, inline-styled HTML email built for daily investor distribution.
 * This template expects a Benzinga-driven digest (news + calendars) and renders
 * a concise, skimmable briefing with live links.
 */

// Core digest shape for Benzinga breakfast
export interface BenzingaBreakfastDigest {
  timestamp: number | string;
  headlineSummary?: string;
  overallMood?: 'risk_on' | 'risk_off' | 'neutral';
  topHeadlines: Array<{
    title: string;
    source: string;
    url: string;
    publishedAt: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    summary?: string;
    tickers?: string[];
  }>;
  preMarketMovers?: Array<{
    symbol: string;
    name?: string;
    changePct: number;
    price?: number;
    volume?: number;
    reason?: string;
    session?: 'pre' | 'regular' | 'post';
  }>;
  earningsToday?: Array<{
    ticker: string;
    name?: string;
    time?: 'BMO' | 'AMC' | 'Unspecified';
    epsEstimate?: number;
    revenueEstimate?: number;
    url?: string;
  }>;
  dividends?: Array<{
    ticker: string;
    name?: string;
    exDate: string;
    payDate?: string;
    amount?: number;
    frequency?: string;
  }>;
  splits?: Array<{
    ticker: string;
    name?: string;
    ratio: string;
    effectiveDate: string;
  }>;
  ipos?: Array<{
    name: string;
    ticker?: string;
    pricingDate?: string;
    priceRange?: string;
    dealStatus?: string;
    url?: string;
  }>;
  guidance?: Array<{
    ticker: string;
    name?: string;
    period?: string;
    epsGuidance?: string;
    revenueGuidance?: string;
    url?: string;
  }>;
  economics?: Array<{
    country: string;
    eventName: string;
    time?: string;
    period?: string;
    actual?: string;
    consensus?: string;
    prior?: string;
    importance?: number;
  }>;
  analystRatings?: Array<{
    ticker: string;
    name?: string;
    firm?: string;
    action?: string;
    priceTarget?: string;
    pricePrior?: string;
    url?: string;
  }>;
  optionsActivity?: Array<{
    ticker: string;
    name?: string;
    tradeType?: string;
    details?: string;
    spotPrice?: number;
    expiry?: string;
    strike?: number;
    flowSize?: string;
    url?: string;
  }>;
  bullBearSummary?: string;
  risks?: string[];
  callToActionUrl?: string;
  unsubscribeUrl?: string;
}

interface EmailTemplateProps {
  digest: BenzingaBreakfastDigest;
  recipientEmail?: string;
}

const formatDate = (ts: number | string) =>
  new Date(ts).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const moodBadge = (mood?: BenzingaBreakfastDigest['overallMood']) => {
  switch (mood) {
    case 'risk_on':
      return { label: 'Risk-On', bg: '#d1fae5', color: '#065f46', emoji: '🚀' };
    case 'risk_off':
      return { label: 'Risk-Off', bg: '#fee2e2', color: '#991b1b', emoji: '🛡️' };
    default:
      return { label: 'Neutral', bg: '#e5e7eb', color: '#374151', emoji: '⚖️' };
  }
};

const sentimentPill = (s?: 'positive' | 'neutral' | 'negative') => {
  if (s === 'positive') return { bg: '#d1fae5', color: '#065f46', label: 'Positive' };
  if (s === 'negative') return { bg: '#fee2e2', color: '#991b1b', label: 'Negative' };
  return { bg: '#f3f4f6', color: '#4b5563', label: 'Neutral' };
};

export function generateBenzingaBreakfastEmailHTML(digest: BenzingaBreakfastDigest, recipientEmail?: string): string {
  const date = formatDate(digest.timestamp);
  const mood = moodBadge(digest.overallMood);

  const topHeadlines = digest.topHeadlines?.slice(0, 5) || [];
  const movers = digest.preMarketMovers?.slice(0, 6) || [];
  const earnings = digest.earningsToday?.slice(0, 6) || [];
  const dividends = digest.dividends?.slice(0, 4) || [];
  const splits = digest.splits?.slice(0, 3) || [];
  const ipos = digest.ipos?.slice(0, 3) || [];
  const guidance = digest.guidance?.slice(0, 3) || [];
  const economics = digest.economics?.slice(0, 4) || [];
  const ratings = digest.analystRatings?.slice(0, 4) || [];
  const options = digest.optionsActivity?.slice(0, 4) || [];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Valura x Benzinga Breakfast - ${date}</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background:#f5f7fb; color:#1f2937; line-height:1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:680px; margin:0 auto; background:#ffffff; box-shadow:0 12px 40px rgba(15,23,42,0.08); border-radius:16px; overflow:hidden;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 35%, #7c3aed 100%); padding:28px 24px; color:#fff;">
        <div style="font-size:36px; margin-bottom:8px;">☕</div>
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <h1 style="margin:0; font-size:26px; font-weight:800; letter-spacing:-0.4px;">Valura x Benzinga Breakfast</h1>
          <span style="padding:6px 10px; border-radius:999px; background:${mood.bg}; color:${mood.color}; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">${mood.emoji} ${mood.label}</span>
        </div>
        <p style="margin:6px 0 0 0; font-size:13px; color:rgba(255,255,255,0.85);">${date}</p>
        ${digest.headlineSummary ? `<p style="margin:10px 0 0 0; font-size:14px; color:#e0e7ff;">${digest.headlineSummary}</p>` : ''}
      </td>
    </tr>

    <!-- Top Headlines -->
    ${topHeadlines.length ? `
    <tr>
      <td style="padding:20px 24px 12px 24px;">
        <h3 style="margin:0 0 12px 0; font-size:16px; font-weight:800; text-transform:uppercase; letter-spacing:0.6px; color:#111827;">Top Headlines</h3>
        ${topHeadlines.map(h => {
          const pill = sentimentPill(h.sentiment);
          return `
          <div style="border:1px solid #e5e7eb; border-radius:12px; padding:14px; margin-bottom:10px; background:#ffffff;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px;">
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <span style="padding:4px 10px; border-radius:999px; background:${pill.bg}; color:${pill.color}; font-weight:700; font-size:11px;">${pill.label}</span>
                <span style="font-size:11px; color:#6b7280;">${h.source} • ${h.publishedAt}</span>
                ${h.tickers && h.tickers.length ? `<span style="font-size:11px; color:#6b7280;">${h.tickers.slice(0,3).join(' • ')}</span>` : ''}
              </div>
              <a href="${h.url}" target="_blank" rel="noopener noreferrer" style="font-size:12px; color:#2563eb; font-weight:700; text-decoration:none;">Read →</a>
            </div>
            <div style="font-size:15px; font-weight:700; color:#111827; margin-bottom:6px; line-height:1.5;">${h.title}</div>
            ${h.summary ? `<div style="font-size:13px; color:#4b5563; line-height:1.55;">${h.summary}</div>` : ''}
          </div>
          `;
        }).join('')}
      </td>
    </tr>
    ` : ''}

    <!-- Pre-Market Movers -->
    ${movers.length ? `
    <tr>
      <td style="padding:4px 24px 12px 24px;">
        <h3 style="margin:0 0 10px 0; font-size:15px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#111827;">Pre-Market Movers</h3>
        ${movers.map(m => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px; margin-bottom:8px; background:#f9fafb;">
            <div>
              <div style="font-family:'Courier New', monospace; font-weight:800; font-size:14px; color:#111827;">${m.symbol}</div>
              <div style="font-size:12px; color:#6b7280;">${m.name || ''}</div>
              ${m.reason ? `<div style="font-size:12px; color:#4b5563; margin-top:4px;">${m.reason}</div>` : ''}
            </div>
            <div style="text-align:right; min-width:110px;">
              <div style="font-size:14px; font-weight:800; color:${m.changePct >= 0 ? '#16a34a' : '#dc2626'};">${m.changePct >= 0 ? '↗' : '↘'} ${m.changePct.toFixed(2)}%</div>
              ${m.price !== undefined ? `<div style="font-size:12px; color:#6b7280;">$${m.price.toFixed(2)}</div>` : ''}
              ${m.volume !== undefined ? `<div style="font-size:11px; color:#9ca3af;">Vol ${m.volume.toLocaleString()}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </td>
    </tr>
    ` : ''}

    <!-- Calendars Row -->
    ${(earnings.length || dividends.length || splits.length) ? `
    <tr>
      <td style="padding:4px 24px 12px 24px;">
        <div style="display:flex; flex-wrap:wrap; gap:12px;">
          ${earnings.length ? `
          <div style="flex:1 1 200px; border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#f8fafc;">
            <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:0.4px; color:#0f172a;">Earnings Today</h4>
            ${earnings.map(e => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#0f172a;">${e.ticker} ${e.name ? '· ' + e.name : ''}</div>
                <div style="font-size:12px; color:#475569;">${e.time || 'Time TBC'}${e.epsEstimate !== undefined ? ` · EPS est: ${e.epsEstimate}` : ''}${e.revenueEstimate !== undefined ? ` · Rev est: ${e.revenueEstimate}` : ''}</div>
                ${e.url ? `<a href="${e.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:#2563eb; font-weight:700; text-decoration:none;">Details →</a>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${dividends.length ? `
          <div style="flex:1 1 180px; border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#f8fafc;">
            <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:0.4px; color:#0f172a;">Dividends / Ex-Dates</h4>
            ${dividends.map(d => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#0f172a;">${d.ticker}${d.name ? ' · ' + d.name : ''}</div>
                <div style="font-size:12px; color:#475569;">Ex: ${d.exDate}${d.amount !== undefined ? ` · $${d.amount}` : ''}${d.frequency ? ` · ${d.frequency}` : ''}</div>
                ${d.payDate ? `<div style="font-size:11px; color:#6b7280;">Payable: ${d.payDate}</div>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${splits.length ? `
          <div style="flex:1 1 160px; border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#f8fafc;">
            <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:0.4px; color:#0f172a;">Splits</h4>
            ${splits.map(s => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#0f172a;">${s.ticker}${s.name ? ' · ' + s.name : ''}</div>
                <div style="font-size:12px; color:#475569;">${s.ratio} · ${s.effectiveDate}</div>
              </div>
            `).join('')}
          </div>` : ''}
        </div>
      </td>
    </tr>
    ` : ''}

    <!-- IPOs & Guidance & Economics -->
    ${(ipos.length || guidance.length || economics.length) ? `
    <tr>
      <td style="padding:4px 24px 12px 24px;">
        <div style="display:flex; flex-wrap:wrap; gap:12px;">
          ${ipos.length ? `
          <div style="flex:1 1 200px; border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#fff7ed;">
            <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:800; letter-spacing:0.4px; color:#7c2d12;">IPOs / Offerings</h4>
            ${ipos.map(i => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#7c2d12;">${i.ticker ? i.ticker + ' · ' : ''}${i.name}</div>
                <div style="font-size:12px; color:#92400e;">${i.pricingDate || 'TBA'}${i.priceRange ? ' · ' + i.priceRange : ''}${i.dealStatus ? ' · ' + i.dealStatus : ''}</div>
                ${i.url ? `<a href="${i.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:#c2410c; font-weight:700; text-decoration:none;">Details →</a>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${guidance.length ? `
          <div style="flex:1 1 200px; border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#eef2ff;">
            <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:800; letter-spacing:0.4px; color:#312e81;">Guidance</h4>
            ${guidance.map(g => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#312e81;">${g.ticker}${g.name ? ' · ' + g.name : ''}</div>
                <div style="font-size:12px; color:#4338ca;">${g.period || ''}${g.epsGuidance ? ' · EPS: ' + g.epsGuidance : ''}${g.revenueGuidance ? ' · Rev: ' + g.revenueGuidance : ''}</div>
                ${g.url ? `<a href="${g.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:#4338ca; font-weight:700; text-decoration:none;">Details →</a>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${economics.length ? `
          <div style="flex:1 1 200px; border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#ecfeff;">
            <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:800; letter-spacing:0.4px; color:#0f172a;">Macro Calendar</h4>
            ${economics.map(ev => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#0f172a;">${ev.eventName} (${ev.country})</div>
                <div style="font-size:12px; color:#334155;">${ev.time || 'Time TBC'}${ev.period ? ' · ' + ev.period : ''}${ev.actual ? ' · Actual: ' + ev.actual : ''}${ev.consensus ? ' · Cons: ' + ev.consensus : ''}${ev.prior ? ' · Prior: ' + ev.prior : ''}</div>
              </div>
            `).join('')}
          </div>` : ''}
        </div>
      </td>
    </tr>
    ` : ''}

    <!-- Analyst Ratings & Options Flow -->
    ${(ratings.length || options.length) ? `
    <tr>
      <td style="padding:4px 24px 16px 24px;">
        <div style="display:flex; flex-wrap:wrap; gap:12px;">
          ${ratings.length ? `
          <div style="flex:1 1 220px; border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#f8fafc;">
            <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:800; letter-spacing:0.4px; color:#0f172a;">Analyst Actions</h4>
            ${ratings.map(r => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#0f172a;">${r.ticker}${r.name ? ' · ' + r.name : ''}</div>
                <div style="font-size:12px; color:#475569;">${r.firm || 'Analyst'}: ${r.action || ''}${r.priceTarget ? ' · PT: ' + r.priceTarget : ''}${r.pricePrior ? ' (prior ' + r.pricePrior + ')' : ''}</div>
                ${r.url ? `<a href="${r.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:#2563eb; font-weight:700; text-decoration:none;">Details →</a>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${options.length ? `
          <div style="flex:1 1 220px; border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#fff1f2;">
            <h4 style="margin:0 0 8px 0; font-size:14px; font-weight:800; letter-spacing:0.4px; color:#9f1239;">Unusual Options</h4>
            ${options.map(o => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#9f1239;">${o.ticker}${o.name ? ' · ' + o.name : ''}</div>
                <div style="font-size:12px; color:#be123c;">${o.tradeType || ''}${o.flowSize ? ' · ' + o.flowSize : ''}${o.spotPrice !== undefined ? ' · Spot: $' + o.spotPrice.toFixed(2) : ''}</div>
                ${o.expiry || o.strike ? `<div style="font-size:12px; color:#be123c;">${o.expiry ? 'Exp: ' + o.expiry : ''}${o.strike ? ' · Strike: ' + o.strike : ''}</div>` : ''}
                ${o.details ? `<div style="font-size:12px; color:#9f1239; margin-top:2px;">${o.details}</div>` : ''}
                ${o.url ? `<a href="${o.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:#be123c; font-weight:700; text-decoration:none;">Details →</a>` : ''}
              </div>
            `).join('')}
          </div>` : ''}
        </div>
      </td>
    </tr>
    ` : ''}

    <!-- Bottom Line -->
    ${(digest.bullBearSummary || (digest.risks && digest.risks.length)) ? `
    <tr>
      <td style="padding:12px 24px 24px 24px;">
        <div style="border-radius:14px; padding:16px; background:linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%); color:#fff;">
          <div style="display:flex; align-items:flex-start; gap:10px;">
            <div style="font-size:22px; line-height:1;">✅</div>
            <div style="flex:1;">
              <h4 style="margin:0 0 6px 0; font-size:15px; font-weight:800; letter-spacing:0.3px;">Bottom Line</h4>
              ${digest.bullBearSummary ? `<div style="font-size:13px; line-height:1.6; margin-bottom:8px;">${digest.bullBearSummary}</div>` : ''}
              ${digest.risks && digest.risks.length ? `
              <div style="margin-top:6px;">
                <div style="font-weight:700; font-size:12px; opacity:0.9; text-transform:uppercase; letter-spacing:0.3px;">Watchouts</div>
                <ul style="padding-left:18px; margin:6px 0 0 0; color:rgba(255,255,255,0.9); font-size:13px; line-height:1.5;">
                  ${digest.risks.slice(0,3).map(r => `<li>${r}</li>`).join('')}
                </ul>
              </div>` : ''}
            </div>
          </div>
        </div>
      </td>
    </tr>
    ` : ''}

    <!-- CTA -->
    ${digest.callToActionUrl ? `
    <tr>
      <td style="padding:0 24px 24px 24px; text-align:center;">
        <a href="${digest.callToActionUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:12px 20px; border-radius:10px; background:#2563eb; color:#fff; font-weight:800; text-decoration:none; box-shadow:0 10px 25px rgba(37,99,235,0.3);">
          View full dashboard →
        </a>
      </td>
    </tr>
    ` : ''}

    <!-- Footer -->
    <tr>
      <td style="background:#f8fafc; padding:18px; text-align:center; border-top:1px solid #e5e7eb;">
        <p style="margin:0 0 6px 0; font-size:12px; color:#6b7280;">Powered by Valura · News & calendars from Benzinga</p>
        <p style="margin:0; font-size:11px; color:#9ca3af; font-style:italic;">For informational purposes only. Not investment advice.</p>
        ${recipientEmail ? `<p style="margin:10px 0 0 0; font-size:11px; color:#9ca3af;">Sent to ${recipientEmail}</p>` : ''}
        ${digest.unsubscribeUrl ? `<p style="margin:6px 0 0 0; font-size:11px;"><a href="${digest.unsubscribeUrl}" style="color:#6b7280; text-decoration:none;">Unsubscribe</a></p>` : ''}
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// React component for preview/testing
export function BenzingaBreakfastEmail({ digest, recipientEmail }: EmailTemplateProps) {
  return <div dangerouslySetInnerHTML={{ __html: generateBenzingaBreakfastEmailHTML(digest, recipientEmail) }} />;
}
