/**
 * Valura x Benzinga Breakfast Email (Funky Edition)
 * Dark, punchy, “Daily Brief” vibe with inline styles for email clients.
 * Drop in market boards, fear gauge, headlines, and quick takes.
 */

// Core digest shape for Benzinga breakfast
export interface BenzingaBreakfastDigest {
  timestamp: number | string;
  headlineSummary?: string;
  overallMood?: 'risk_on' | 'risk_off' | 'neutral';
  readTimeMinutes?: number;
  viewInBrowserUrl?: string;
  marketBoard?: Array<{
    label: string;
    value?: string;
    changePct?: number;
    sublabel?: string;
  }>;
  fearGauge?: {
    value: number; // 0-100
    label?: string;
  };
  quickTakes?: string[];
  topGainers?: Array<{
    symbol: string;
    name?: string;
    price?: number;
    changePct: number;
    volume?: number;
  }>;
  topLosers?: Array<{
    symbol: string;
    name?: string;
    price?: number;
    changePct: number;
    volume?: number;
  }>;
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
  const readTime = digest.readTimeMinutes ?? 3;

  // Normalize fear gauge to [0, 100]
  const fearValue =
    digest.fearGauge && Number.isFinite(digest.fearGauge.value)
      ? Math.max(0, Math.min(100, digest.fearGauge.value))
      : null;

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
  const quickTakes =
    digest.quickTakes && digest.quickTakes.length
      ? digest.quickTakes.slice(0, 5)
      : [
          digest.headlineSummary ||
            (mood.label === 'Risk-On'
              ? 'Risk-on tone; cyclicals and tech in the lead.'
              : mood.label === 'Risk-Off'
                ? 'Risk-off tone; defensives and cash look steadier.'
                : 'Mixed tape; watch catalysts and macro prints.'),
        ];

  const hasMarketBoard = digest.marketBoard && digest.marketBoard.length > 0;
  const gainers = digest.topGainers?.slice(0, 6) || [];
  const losers = digest.topLosers?.slice(0, 6) || [];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Valura x Benzinga Breakfast - ${date}</title>
</head>
<body style="margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background:#0f1117; color:#e5e7eb; line-height:1.7;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:720px; margin:0 auto; background:#0f1117;">
    <!-- Top bar -->
    <tr>
      <td style="padding:12px 16px; font-size:12px; color:#9ca3af; display:flex; align-items:center; justify-content:space-between; background:#0b0d13;">
        <span>Fri, ${date} · ${readTime} min read</span>
        ${digest.viewInBrowserUrl ? `<a href="${digest.viewInBrowserUrl}" target="_blank" rel="noopener noreferrer" style="color:#8b5cf6; text-decoration:none; font-weight:700;">View in browser</a>` : ''}
      </td>
    </tr>

    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #111827 0%, #111827 30%, #1f2937 100%); padding:24px 20px 18px 20px; border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="font-size:32px; font-weight:800; color:#fff; letter-spacing:-0.4px; text-transform:uppercase;">Valura × Benzinga Breakfast</div>
        <div style="margin-top:10px; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <span style="padding:6px 10px; border-radius:999px; background:${mood.bg}; color:${mood.color}; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:0.6px;">${mood.emoji} ${mood.label}</span>
          <span style="font-size:12px; color:#9ca3af;">${date}</span>
        </div>
        ${digest.headlineSummary ? `<p style="margin:12px 0 0 0; font-size:14px; color:#d1d5db;">${digest.headlineSummary}</p>` : ''}
      </td>
    </tr>

    <!-- Market Board / What's Going On -->
    <tr>
      <td style="padding:16px 20px; background:#0f1117; color:#e5e7eb;">
        <div style="font-size:13px; letter-spacing:0.8px; text-transform:uppercase; color:#9ca3af; font-weight:800; margin-bottom:10px;">👀 What’s going on</div>
        ${
          hasMarketBoard
            ? `
        <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
          ${digest.marketBoard!
            .slice(0, 6)
            .map((m) => {
              const pct = m.changePct ?? 0;
              const up = pct > 0;
              const flat = pct === 0;
              return `
              <div style="flex:1 1 140px; min-width:140px; border:1px solid rgba(255,255,255,0.08); background:#111827; border-radius:10px; padding:10px 12px;">
                <div style="font-size:12px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px; font-weight:700;">${m.label}</div>
                <div style="font-size:18px; font-weight:800; color:#fff; margin:4px 0;">${m.value ?? '—'}</div>
                <div style="font-size:12px; color:${flat ? '#9ca3af' : up ? '#22c55e' : '#f87171'}; font-weight:700;">
                  ${flat ? '•' : up ? '▲' : '▼'} ${m.changePct !== undefined ? `${m.changePct.toFixed(2)}%` : '—'}
                </div>
                ${m.sublabel ? `<div style="font-size:11px; color:#6b7280; margin-top:2px;">${m.sublabel}</div>` : ''}
              </div>
              `;
            })
            .join('')}
        </div>
        `
            : `<div style="font-size:12px; color:#6b7280;">Add <code>marketBoard</code> to your digest for S&P/Nasdaq/Gold/Oil/BTC/Bonds.</div>`
        }

        ${
          fearValue !== null
            ? `
        <div style="margin-top:12px;">
          <div style="font-size:12px; font-weight:800; color:#e5e7eb; margin-bottom:6px;">Wall Street Fear Gauge (VIX)</div>
          <div style="height:14px; border-radius:999px; background:linear-gradient(90deg, #22c55e 0%, #facc15 50%, #ef4444 100%); position:relative; overflow:hidden;">
            <div style="position:absolute; left:${fearValue}%; top:0; bottom:0; width:2px; background:#fff; box-shadow:0 0 6px rgba(255,255,255,0.9);"></div>
          </div>
          <div style="font-size:11px; color:#9ca3af; margin-top:4px;">${fearValue} / 100 ${digest.fearGauge?.label ? '· ' + digest.fearGauge.label : ''}</div>
        </div>
        `
            : ''
        }
      </td>
    </tr>

    <!-- Quick Takes -->
    <tr>
      <td style="padding:8px 20px 12px 20px; background:#0f1117;">
        <div style="font-size:13px; letter-spacing:0.8px; text-transform:uppercase; color:#9ca3af; font-weight:800; margin-bottom:8px;">⚡ Quick takes</div>
        <ul style="margin:0; padding-left:18px; color:#e5e7eb; font-size:13px; line-height:1.6;">
          ${quickTakes.map((q) => `<li style="margin-bottom:6px;">${q}</li>`).join('')}
        </ul>
      </td>
    </tr>

    <!-- Top Headlines -->
    ${topHeadlines.length ? `
    <tr>
      <td style="padding:14px 20px 6px 20px;">
        <h3 style="margin:0 0 10px 0; font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:0.6px; color:#cbd5e1;">Top Headlines</h3>
        ${topHeadlines.map(h => {
          const pill = sentimentPill(h.sentiment);
          return `
          <div style="border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px; margin-bottom:10px; background:#111827;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px;">
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <span style="padding:4px 10px; border-radius:999px; background:${pill.bg}; color:${pill.color}; font-weight:700; font-size:11px;">${pill.label}</span>
                <span style="font-size:11px; color:#9ca3af;">${h.source} • ${h.publishedAt}</span>
                ${h.tickers && h.tickers.length ? `<span style="font-size:11px; color:#9ca3af;">${h.tickers.slice(0,3).join(' • ')}</span>` : ''}
              </div>
              <a href="${h.url}" target="_blank" rel="noopener noreferrer" style="font-size:12px; color:#60a5fa; font-weight:700; text-decoration:none;">Read →</a>
            </div>
            <div style="font-size:15px; font-weight:800; color:#f9fafb; margin-bottom:6px; line-height:1.5;">${h.title}</div>
            ${h.summary ? `<div style="font-size:13px; color:#cbd5e1; line-height:1.55;">${h.summary}</div>` : ''}
          </div>
          `;
        }).join('')}
      </td>
    </tr>
    ` : ''}

    <!-- Pre-Market Movers -->
    ${movers.length ? `
    <tr>
      <td style="padding:4px 20px 10px 20px;">
        <h3 style="margin:0 0 8px 0; font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#cbd5e1;">Pre-Market Movers</h3>
        ${movers.map(m => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; margin-bottom:8px; background:#0f172a;">
            <div>
              <div style="font-family:'Courier New', monospace; font-weight:800; font-size:14px; color:#e5e7eb;">${m.symbol}</div>
              <div style="font-size:12px; color:#9ca3af;">${m.name || ''}</div>
              ${m.reason ? `<div style="font-size:12px; color:#cbd5e1; margin-top:4px;">${m.reason}</div>` : ''}
            </div>
            <div style="text-align:right; min-width:110px;">
              <div style="font-size:14px; font-weight:800; color:${m.changePct >= 0 ? '#22c55e' : '#f87171'};">${m.changePct >= 0 ? '↗' : '↘'} ${m.changePct.toFixed(2)}%</div>
              ${m.price !== undefined ? `<div style="font-size:12px; color:#9ca3af;">$${m.price.toFixed(2)}</div>` : ''}
              ${m.volume !== undefined ? `<div style="font-size:11px; color:#6b7280;">Vol ${m.volume.toLocaleString()}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </td>
    </tr>
    ` : ''}

    <!-- Top Gainers / Losers -->
    ${(gainers.length || losers.length) ? `
    <tr>
      <td style="padding:4px 20px 10px 20px;">
        <div style="display:flex; flex-wrap:wrap; gap:12px;">
          ${gainers.length ? `
          <div style="flex:1 1 240px; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; background:#0f172a;">
            <h4 style="margin:0 0 8px 0; font-size:13px; font-weight:800; letter-spacing:0.4px; color:#22c55e; text-transform:uppercase;">Top Gainers</h4>
            ${gainers.map(g => `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <div>
                  <div style="font-weight:800; font-size:13px; color:#f9fafb;">${g.symbol}${g.name ? ' · ' + g.name : ''}</div>
                  ${g.price !== undefined ? `<div style="font-size:12px; color:#9ca3af;">$${g.price.toFixed(2)}</div>` : ''}
                  ${g.volume !== undefined ? `<div style="font-size:11px; color:#6b7280;">Vol ${g.volume.toLocaleString()}</div>` : ''}
                </div>
                <div style="font-weight:800; font-size:13px; color:#22c55e;">↗ ${g.changePct.toFixed(2)}%</div>
              </div>
            `).join('')}
          </div>` : ''}

          ${losers.length ? `
          <div style="flex:1 1 240px; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; background:#0f172a;">
            <h4 style="margin:0 0 8px 0; font-size:13px; font-weight:800; letter-spacing:0.4px; color:#f87171; text-transform:uppercase;">Top Losers</h4>
            ${losers.map(g => `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <div>
                  <div style="font-weight:800; font-size:13px; color:#f9fafb;">${g.symbol}${g.name ? ' · ' + g.name : ''}</div>
                  ${g.price !== undefined ? `<div style="font-size:12px; color:#9ca3af;">$${g.price.toFixed(2)}</div>` : ''}
                  ${g.volume !== undefined ? `<div style="font-size:11px; color:#6b7280;">Vol ${g.volume.toLocaleString()}</div>` : ''}
                </div>
                <div style="font-weight:800; font-size:13px; color:#f87171;">↘ ${g.changePct.toFixed(2)}%</div>
              </div>
            `).join('')}
          </div>` : ''}
        </div>
      </td>
    </tr>
    ` : ''}

    <!-- Calendars Row -->
    ${(earnings.length || dividends.length || splits.length) ? `
    <tr>
      <td style="padding:4px 20px 10px 20px;">
        <div style="display:flex; flex-wrap:wrap; gap:12px;">
          ${earnings.length ? `
          <div style="flex:1 1 200px; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; background:#111827;">
            <h4 style="margin:0 0 8px 0; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.4px; color:#e5e7eb;">Earnings Today</h4>
            ${earnings.map(e => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#f3f4f6;">${e.ticker} ${e.name ? '· ' + e.name : ''}</div>
                <div style="font-size:12px; color:#9ca3af;">${e.time || 'Time TBC'}${e.epsEstimate !== undefined ? ` · EPS est: ${e.epsEstimate}` : ''}${e.revenueEstimate !== undefined ? ` · Rev est: ${e.revenueEstimate}` : ''}</div>
                ${e.url ? `<a href="${e.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:#60a5fa; font-weight:700; text-decoration:none;">Details →</a>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${dividends.length ? `
          <div style="flex:1 1 180px; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; background:#111827;">
            <h4 style="margin:0 0 8px 0; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.4px; color:#e5e7eb;">Dividends / Ex-Dates</h4>
            ${dividends.map(d => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#f3f4f6;">${d.ticker}${d.name ? ' · ' + d.name : ''}</div>
                <div style="font-size:12px; color:#9ca3af;">Ex: ${d.exDate}${d.amount !== undefined ? ` · $${d.amount}` : ''}${d.frequency ? ` · ${d.frequency}` : ''}</div>
                ${d.payDate ? `<div style="font-size:11px; color:#6b7280;">Payable: ${d.payDate}</div>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${splits.length ? `
          <div style="flex:1 1 160px; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; background:#111827;">
            <h4 style="margin:0 0 8px 0; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.4px; color:#e5e7eb;">Splits</h4>
            ${splits.map(s => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#f3f4f6;">${s.ticker}${s.name ? ' · ' + s.name : ''}</div>
                <div style="font-size:12px; color:#9ca3af;">${s.ratio} · ${s.effectiveDate}</div>
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
      <td style="padding:4px 20px 10px 20px;">
        <div style="display:flex; flex-wrap:wrap; gap:12px;">
          ${ipos.length ? `
          <div style="flex:1 1 200px; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; background:#1f2937;">
            <h4 style="margin:0 0 8px 0; font-size:13px; font-weight:800; letter-spacing:0.4px; color:#fef3c7;">IPOs / Offerings</h4>
            ${ipos.map(i => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#fef3c7;">${i.ticker ? i.ticker + ' · ' : ''}${i.name}</div>
                <div style="font-size:12px; color:#fcd34d;">${i.pricingDate || 'TBA'}${i.priceRange ? ' · ' + i.priceRange : ''}${i.dealStatus ? ' · ' + i.dealStatus : ''}</div>
                ${i.url ? `<a href="${i.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:#fbbf24; font-weight:700; text-decoration:none;">Details →</a>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${guidance.length ? `
          <div style="flex:1 1 200px; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; background:#1f2937;">
            <h4 style="margin:0 0 8px 0; font-size:13px; font-weight:800; letter-spacing:0.4px; color:#c7d2fe;">Guidance</h4>
            ${guidance.map(g => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#e0e7ff;">${g.ticker}${g.name ? ' · ' + g.name : ''}</div>
                <div style="font-size:12px; color:#c7d2fe;">${g.period || ''}${g.epsGuidance ? ' · EPS: ' + g.epsGuidance : ''}${g.revenueGuidance ? ' · Rev: ' + g.revenueGuidance : ''}</div>
                ${g.url ? `<a href="${g.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:#a5b4fc; font-weight:700; text-decoration:none;">Details →</a>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${economics.length ? `
          <div style="flex:1 1 200px; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; background:#0f172a;">
            <h4 style="margin:0 0 8px 0; font-size:13px; font-weight:800; letter-spacing:0.4px; color:#7dd3fc;">Macro Calendar</h4>
            ${economics.map(ev => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#e0f2fe;">${ev.eventName} (${ev.country})</div>
                <div style="font-size:12px; color:#bae6fd;">${ev.time || 'Time TBC'}${ev.period ? ' · ' + ev.period : ''}${ev.actual ? ' · Actual: ' + ev.actual : ''}${ev.consensus ? ' · Cons: ' + ev.consensus : ''}${ev.prior ? ' · Prior: ' + ev.prior : ''}</div>
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
      <td style="padding:4px 20px 16px 20px;">
        <div style="display:flex; flex-wrap:wrap; gap:12px;">
          ${ratings.length ? `
          <div style="flex:1 1 220px; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; background:#111827;">
            <h4 style="margin:0 0 8px 0; font-size:13px; font-weight:800; letter-spacing:0.4px; color:#e5e7eb;">Analyst Actions</h4>
            ${ratings.map(r => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#f9fafb;">${r.ticker}${r.name ? ' · ' + r.name : ''}</div>
                <div style="font-size:12px; color:#cbd5e1;">${r.firm || 'Analyst'}: ${r.action || ''}${r.priceTarget ? ' · PT: ' + r.priceTarget : ''}${r.pricePrior ? ' (prior ' + r.pricePrior + ')' : ''}</div>
                ${r.url ? `<a href="${r.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:#60a5fa; font-weight:700; text-decoration:none;">Details →</a>` : ''}
              </div>
            `).join('')}
          </div>` : ''}

          ${options.length ? `
          <div style="flex:1 1 220px; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; background:#18181b;">
            <h4 style="margin:0 0 8px 0; font-size:13px; font-weight:800; letter-spacing:0.4px; color:#fda4af;">Unusual Options</h4>
            ${options.map(o => `
              <div style="margin-bottom:8px;">
                <div style="font-weight:800; font-size:13px; color:#fecdd3;">${o.ticker}${o.name ? ' · ' + o.name : ''}</div>
                <div style="font-size:12px; color:#fda4af;">${o.tradeType || ''}${o.flowSize ? ' · ' + o.flowSize : ''}${o.spotPrice !== undefined ? ' · Spot: $' + o.spotPrice.toFixed(2) : ''}</div>
                ${o.expiry || o.strike ? `<div style="font-size:12px; color:#fda4af;">${o.expiry ? 'Exp: ' + o.expiry : ''}${o.strike ? ' · Strike: ' + o.strike : ''}</div>` : ''}
                ${o.details ? `<div style="font-size:12px; color:#fecdd3; margin-top:2px;">${o.details}</div>` : ''}
                ${o.url ? `<a href="${o.url}" target="_blank" rel="noopener noreferrer" style="font-size:11px; color:#fb7185; font-weight:700; text-decoration:none;">Details →</a>` : ''}
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
      <td style="padding:10px 20px 18px 20px;">
        <div style="border-radius:14px; padding:16px; background:linear-gradient(135deg, #312e81 0%, #6d28d9 100%); color:#fff; border:1px solid rgba(255,255,255,0.12); box-shadow:0 15px 40px rgba(109,40,217,0.25);">
          <div style="display:flex; align-items:flex-start; gap:10px;">
            <div style="font-size:22px; line-height:1;">✅</div>
            <div style="flex:1;">
              <h4 style="margin:0 0 6px 0; font-size:14px; font-weight:800; letter-spacing:0.3px; text-transform:uppercase;">Bottom Line</h4>
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
      <td style="padding:0 20px 18px 20px; text-align:center;">
        <a href="${digest.callToActionUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:12px 20px; border-radius:10px; background:#3b82f6; color:#fff; font-weight:800; text-decoration:none; box-shadow:0 10px 25px rgba(59,130,246,0.35);">
          View full dashboard →
        </a>
      </td>
    </tr>
    ` : ''}

    <!-- Footer -->
    <tr>
      <td style="background:#0b0d13; padding:16px; text-align:center; border-top:1px solid rgba(255,255,255,0.08);">
        <p style="margin:0 0 6px 0; font-size:12px; color:#9ca3af;">Powered by Valura · News & calendars from Benzinga</p>
        <p style="margin:0; font-size:11px; color:#6b7280; font-style:italic;">For informational purposes only. Not investment advice.</p>
        ${recipientEmail ? `<p style="margin:10px 0 0 0; font-size:11px; color:#6b7280;">Sent to ${recipientEmail}</p>` : ''}
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
