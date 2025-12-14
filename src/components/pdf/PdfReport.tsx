/**
 * PDF-only 2-page layout (A4)
 * Rendered via `/?pdf=1` and intended to be printed server-side.
 */

import { useEffect, useMemo, useState } from 'react';
import type { ReportData } from '../../hooks/useReportGenerator';
import { formatPercent, formatNumber } from '../../core/utils/math';
import { calculateEndingValue } from '../../products/reverseConvertible/breakEven';
import { normalizeLevel } from '../../products/common/basket';
import { getLogoWithFallback } from '../../utils/logo';
import { PayoffGraph } from '../report/PayoffGraph';
import { PerformanceGraph } from '../report/PerformanceGraph';
import { buildUnderlyingSummary, type UnderlyingSummary } from '../../services/underlyingSummary';
import valuraLogo from '../../../Valura.ai - Logo (Black).png';

import '../../styles/pdf.css';

declare global {
  interface Window {
    __PDF_READY__?: boolean;
  }
}

function readLastReport(): ReportData | null {
  try {
    const raw = sessionStorage.getItem('valura:lastReport');
    if (!raw) return null;
    return JSON.parse(raw) as ReportData;
  } catch {
    return null;
  }
}

export function PdfReport() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [spotlightSummaries, setSpotlightSummaries] = useState<UnderlyingSummary[]>([]);
  const [spotlightsReady, setSpotlightsReady] = useState(false);

  useEffect(() => {
    setReportData(readLastReport());
  }, []);

  // Fetch richer spotlight summaries for PDF cards
  useEffect(() => {
    if (!reportData) return;
    let cancelled = false;
    setSpotlightsReady(false);

    const timer = window.setTimeout(() => {
      if (!cancelled) setSpotlightsReady(true);
    }, 9000);

    (async () => {
      try {
        const barrierPct = reportData.terms.barrierPct || reportData.terms.strikePct || 0.7;
        const maxCards = Math.min(2, reportData.underlyingData.length);
        const tasks = Array.from({ length: maxCards }).map(async (_v, i) => {
          const u = reportData.underlyingData[i];
          const initialFixing = u.initialFixing || u.currentPrice;
          const rawSeries = reportData.historicalData?.[i] || [];
          const hist = (rawSeries as any[])
            .map((p) => ({
              date: p.date,
              price: (p.price ?? p.close ?? p.adjClose) as number,
              normalized: (p.normalized ?? p.price ?? p.close ?? p.adjClose) as number,
            }))
            .filter((p) => typeof p.price === 'number' && p.price > 0);

          return await buildUnderlyingSummary(u.symbol, initialFixing, barrierPct, hist as any);
        });

        const res = await Promise.all(tasks);
        if (!cancelled) setSpotlightSummaries(res);
      } catch {
        if (!cancelled) setSpotlightSummaries([]);
      } finally {
        window.clearTimeout(timer);
        if (!cancelled) setSpotlightsReady(true);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [reportData]);

  useEffect(() => {
    if (!reportData) return;
    if (!spotlightsReady) {
      window.__PDF_READY__ = false;
      return;
    }
    window.__PDF_READY__ = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.__PDF_READY__ = true;
      });
    });
  }, [reportData, spotlightsReady]);

  const sparklineForIndex = (idx: number) => {
    const raw = (reportData?.historicalData?.[idx] || []) as any[];
    const values = raw
      .map((p) => (p.normalized ?? p.price ?? p.close ?? p.adjClose) as number)
      .filter((v) => typeof v === 'number' && Number.isFinite(v));
    if (values.length < 2) return null;
    const series = raw[0]?.date && raw[1]?.date && String(raw[0].date) > String(raw[1].date) ? [...values].reverse() : values;
    const target = 48;
    const step = Math.max(1, Math.floor(series.length / target));
    const sampled = series.filter((_v, i) => i % step === 0);
    const min = Math.min(...sampled);
    const max = Math.max(...sampled);
    const span = Math.max(1e-6, max - min);
    const w = 180;
    const h = 54;
    const coords = sampled.map((v, i) => {
      const x = (i / (sampled.length - 1)) * w;
      const y = h - ((v - min) / span) * h;
      return { x, y };
    });
    return {
      coords,
      w,
      h,
      last: sampled[sampled.length - 1],
    };
  };

  const computed = useMemo(() => {
    if (!reportData) return null;
    const { terms, underlyingData, barrierLevel, strikeLevel } = reportData;
    const triggerPct = terms.barrierPct ?? terms.strikePct ?? 0;
    const triggerLabel = terms.variant === 'low_strike_geared_put' ? 'Strike' : 'Barrier';
    const underlyingsLabel =
      terms.basketType === 'worst_of'
        ? terms.underlyings.map((u) => u.ticker).join(' / ')
        : terms.underlyings[0]?.ticker || '';

    const tableRows = underlyingData.map((u, i) => {
      const reference = reportData.referencePrices?.[i] ?? u.currentPrice;
      const triggerPrice = reference * triggerPct;
      const lookback = '1Y';
      const retPct = (() => {
        const series = reportData.historicalData?.[i] || [];
        const start = series?.[0]?.close;
        if (!start || !u.currentPrice) return null;
        return ((u.currentPrice / start) - 1) * 100;
      })();

      return {
        symbol: u.symbol,
        name: u.name,
        spot: u.currentPrice,
        retPct,
        lookback,
        triggerPrice,
      };
    });

    const scenarios = [120, 100, 80, 70, 50];
    const scenarioRows = scenarios.map((finalLevel) => calculateEndingValue(terms, finalLevel, terms.notional));

    return {
      triggerPct,
      triggerLabel,
      underlyingsLabel,
      tableRows,
      scenarioRows,
      barrierLevel,
      strikeLevel,
    };
  }, [reportData]);

  if (!reportData || !computed) {
    return (
      <div className="pdf-root">
        <div className="pdf-page">
          <div className="pdf-card" style={{ width: '100%' }}>
            <div className="pdf-section-title">PDF layout</div>
            <div className="pdf-muted pdf-mini">
              No report data found. Generate a report first, then export PDF.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { terms, underlyingData, historicalData, curvePoints, intrinsicValue, barrierLevel, strikeLevel, breakEvenPct, totalCouponsPct } = reportData;
  const couponRateText = formatPercent(terms.couponRatePA, 1);
  const couponFreqText =
    terms.couponFreqPerYear === 12 ? 'Monthly' :
    terms.couponFreqPerYear === 4 ? 'Quarterly' :
    terms.couponFreqPerYear === 2 ? 'Semi-annually' :
    'Annually';
  const currentLevel =
    reportData.worstOfLevel ??
    (underlyingData.length > 0
      ? normalizeLevel(
          underlyingData[0].currentPrice,
          underlyingData[0].initialFixing || underlyingData[0].currentPrice
        )
      : 1.0);

  return (
    <div className="pdf-root" data-pdf-ready={String(!!window.__PDF_READY__)}>
      <style>{`
        .pdf-card, .pdf-underlying-card {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          page-break-inside: avoid; /* Essential */
        }
        .pdf-card--inner {
          box-shadow: none !important;
        }
        .pdf-main-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-bottom: 12px; /* Reduced from 20px */
        }
        .pdf-main-logo {
          height: 32px;
          margin-bottom: 6px;
        }
        .pdf-main-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          line-height: 1.2;
        }
      `}</style>

      {/* PAGE 1 */}
      <div className="pdf-page" style={{ overflow: 'hidden' }}>
        <div className="pdf-sheet">
          <div className="pdf-topbar avoid-break" style={{ width: '100%' }} />
          <div style={{ height: 12 }} /> 

          {/* Branding Header */}
          <div className="pdf-main-header avoid-break">
            <img src={valuraLogo} alt="Valura.ai" className="pdf-main-logo" />
            <div className="pdf-main-title">Structured Product Report</div>
          </div>

          {/* Product details card */}
          <div className="pdf-card pdf-product-card avoid-break" style={{ width: '100%', marginBottom: 6 }}>
            <div>
              <div className="pdf-product-title">Reverse Convertible</div>
              <div className="pdf-product-rate">{couponRateText} p.a.</div>
            </div>

            <div className="pdf-chip-row">
              {underlyingData.slice(0, 1).map((u) => {
                const { logoUrl, fallback } = getLogoWithFallback(u.symbol, u.name);
                return (
                  <span key={u.symbol} className="pdf-chip">
                    <span className="pdf-chip-logo">
                      <img
                        src={logoUrl}
                        alt={u.symbol}
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent && !parent.querySelector('.pdf-logo-fallback')) {
                            const fb = document.createElement('span');
                            fb.className = 'pdf-logo-fallback';
                            fb.textContent = fallback;
                            parent.appendChild(fb);
                          }
                        }}
                      />
                    </span>
                    {u.symbol}
                  </span>
                );
              })}

              <span className="pdf-chip"><span className="muted">{terms.tenorMonths}M</span> Duration</span>
              <span className="pdf-chip"><span className="muted">{terms.currency}</span></span>
              <span className="pdf-chip">
                <span className="muted">{formatPercent(computed.triggerPct, 0)}</span> {computed.triggerLabel}
              </span>
            </div>

            <div className="pdf-spec-grid">
              <div className="pdf-spec-item">
                <div className="k">{computed.triggerLabel}</div>
                <div className="v">{formatPercent(computed.triggerPct, 0)}</div>
              </div>
              <div className="pdf-spec-item">
                <div className="k">Coupon Frequency</div>
                <div className="v">{couponFreqText}</div>
              </div>
              <div className="pdf-spec-item">
                <div className="k">Settlement</div>
                <div className="v">Cash / Shares</div>
              </div>
              <div className="pdf-spec-item">
                <div className="k">Notional</div>
                <div className="v">${formatNumber(terms.notional, 0)}</div>
              </div>
              <div className="pdf-spec-item">
                <div className="k">Coupon total</div>
                <div className="v">{formatPercent(totalCouponsPct, 1)}</div>
              </div>
              <div className="pdf-spec-item">
                <div className="k">Break-even</div>
                <div className="v">{formatPercent(breakEvenPct / 100, 0)}</div>
              </div>
            </div>
          </div>

          <div style={{ height: 6 }} />

          {/* Payoff Graph - constrained height */}
          <div className="avoid-break" style={{ width: '100%', maxHeight: '220px', overflow: 'hidden' }}>
            <PayoffGraph
              curvePoints={curvePoints}
              barrierLevel={barrierLevel}
              strikeLevel={strikeLevel}
              intrinsicValue={intrinsicValue}
              currentLevel={currentLevel}
              variant={terms.variant}
              breakEvenPct={breakEvenPct}
              pdfMode
            />
          </div>

          <div style={{ height: 6 }} />

          {/* Underlyings table */}
          <div className="pdf-card avoid-break" style={{ width: '100%' }}>
            <div className="pdf-section-title">More about the underlyings</div>
            <table className="pdf-table">
              <thead>
                <tr>
                  <th>Underlying</th>
                  <th>Spot</th>
                  <th>Return (1Y)</th>
                  <th>{computed.triggerLabel} price</th>
                </tr>
              </thead>
              <tbody>
                {computed.tableRows.map((r) => (
                  <tr key={r.symbol}>
                    <td>
                      <div className="pdf-td-underlying">
                        <span className="pdf-inline-logo">
                          <img
                            src={getLogoWithFallback(r.symbol, r.name).logoUrl}
                            alt={r.symbol}
                            onError={(e) => {
                              const img = e.currentTarget;
                              img.style.display = 'none';
                            }}
                          />
                        </span>
                        <b style={{ color: 'var(--pdf-ink)' }}>{r.symbol}</b>
                      </div>
                    </td>
                    <td>${formatNumber(r.spot, 2)}</td>
                    <td>
                      {r.retPct == null ? '—' : (
                        <span style={{ color: r.retPct >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {r.retPct >= 0 ? '▲' : '▼'} {formatNumber(r.retPct, 1)}%
                        </span>
                      )}
                    </td>
                    <td>${formatNumber(r.triggerPrice, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ height: 6 }} />

          {/* Good fit + Break-even */}
          <div className="pdf-grid-2-eq" style={{ width: '100%' }}>
            <div className="pdf-card avoid-break" style={{ borderColor: 'rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.06)' }}>
              <div className="pdf-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Good fit if…</span>
                <span className="pdf-pill good">Good fit</span>
              </div>
              <div className="pdf-mini pdf-muted">
                <div>• You want income and accept capped upside</div>
                <div>• Neutral to moderately bullish view</div>
                <div>• You can hold to maturity</div>
              </div>
            </div>
            <div className="pdf-card avoid-break" style={{ borderColor: 'rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.08)' }}>
              <div className="pdf-section-title" style={{ marginBottom: 4 }}>Break-even (including coupons)</div>
              <div className="pdf-mini pdf-muted">
                Break-even worst-of final level: <b style={{ color: 'var(--pdf-ink)' }}>{formatPercent(breakEvenPct / 100, 0)}</b>
                <div style={{ marginTop: 2 }}>
                  Total coupons: <b style={{ color: 'var(--pdf-ink)' }}>{formatPercent(totalCouponsPct, 1)}</b>
                </div>
                <div style={{ marginTop: 2 }}>
                  Rule: total return ≈ 0 when ending value + coupons equals your initial notional.
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pdf-footer" style={{ width: '100%' }}>
            <div className="pdf-footer-band">
              <span><b>Document ID:</b> {reportData.documentId}</span>
              <span className="pdf-muted"><b>Generated:</b> {reportData.generatedDate}</span>
              <span><b>Page</b> 1 of 2</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="pdf-page" style={{ overflow: 'hidden' }}>
        <div className="pdf-sheet">
          <div className="pdf-topbar avoid-break" style={{ width: '100%' }} />
          <div style={{ height: 12 }} />

          <div className="pdf-grid-2" style={{ width: '100%', alignItems: 'start' }}>
            {/* Constrain graph height */}
            <div className="avoid-break" style={{ width: '100%', maxHeight: '200px' }}>
              <PerformanceGraph
                historicalData={historicalData}
                underlyingSymbols={underlyingData.map((u) => u.symbol)}
                barrierLevel={barrierLevel}
                strikeLevel={strikeLevel}
                initialFixings={{}}
                basketType={terms.basketType}
                worstUnderlyingIndex={reportData.worstUnderlyingIndex}
                pdfMode
              />
            </div>
            <div className="pdf-card avoid-break" style={{ width: '100%' }}>
              <div className="pdf-section-title">Outcome examples (compact)</div>
              <table className="pdf-table" style={{ fontSize: '0.65rem' }}>
                <thead>
                  <tr>
                    <th>Final level</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>End value</th>
                  </tr>
                </thead>
                <tbody>
                  {[120, 100, 80, 70, 50].map((lvl) => {
                    const out = calculateEndingValue(terms, lvl, terms.notional);
                    const tone = out.redemptionType === 'Cash' ? 'good' : 'bad';
                    return (
                      <tr key={lvl}>
                        <td><b style={{ color: 'var(--pdf-ink)' }}>{lvl}%</b></td>
                        <td>
                          <span className={`pdf-pill ${tone}`}>{out.redemptionType}</span>
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--pdf-ink)' }}>
                          ${formatNumber(out.endingValue, 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ height: 4 }} />

              <div className="pdf-card pdf-card--inner avoid-break" style={{ padding: 8, borderColor: 'rgba(79,70,229,0.22)', background: 'rgba(79,70,229,0.06)' }}>
                <div className="pdf-section-title" style={{ marginBottom: 2 }}>Key note</div>
                <div className="pdf-mini pdf-muted">
                  Illustrative outcomes. Assumes coupons paid as scheduled and no issuer default.
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 6 }} />

          {/* Underlying spotlights (page 2) */}
          <div className="pdf-card avoid-break" style={{ width: '100%' }}>
            <div className="pdf-section-title">Underlying spotlights</div>
            
            {/* FORCE 2 COLUMNS explicitly to save vertical space */}
            <div 
              className='pdf-spotlight-grid pdf-spotlight-grid-1' 
              style={{ 
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '10px'
              }}
            >
              {(spotlightSummaries.length > 0 ? spotlightSummaries : []).map((s, idx) => {
                const spark = sparklineForIndex(idx);
                const u = underlyingData[idx];
                const ref = reportData.referencePrices?.[idx] ?? u.currentPrice;
                const triggerPrice = ref * (terms.barrierPct ?? terms.strikePct ?? 0);
                const perfTone = s.performancePct >= 0 ? 'good' : 'bad';
                const pathD = spark
                  ? `M ${spark.coords.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')}`
                  : '';
                const areaD = spark
                  ? `M 0 ${spark.h} L ${spark.coords.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')} L ${spark.w} ${spark.h} Z`
                  : '';
                const endDot = spark ? spark.coords[spark.coords.length - 1] : null;

                return (
                  <div key={s.symbol} className="pdf-underlying-card pdf-spotlight-card">
                    <div className="pdf-underlying-head">
                      <div className="pdf-underlying-left">
                        <div className="pdf-logo">
                          <img
                            src={s.logoUrl || getLogoWithFallback(s.symbol, s.name).logoUrl}
                            alt={s.symbol}
                            onError={(e) => {
                              const img = e.currentTarget;
                              img.style.display = 'none';
                            }}
                          />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="pdf-underlying-symbol">{s.symbol}</div>
                          <div className="pdf-underlying-name">{s.name}</div>
                        </div>
                      </div>
                      <div className="pdf-spotlight-badges">
                        {s.riskBadge && <span className={`pdf-pill ${s.riskBadge === 'Low' ? 'good' : s.riskBadge === 'High' ? 'bad' : ''}`}>Risk: {s.riskBadge}</span>}
                        {/* <span className={`pdf-pill ${perfTone}`}>
                          {s.performancePct >= 0 ? '▲' : '▼'} {formatNumber(Math.abs(s.performancePct), 1)}%
                        </span> */}
                      </div>
                    </div>

                    <div className="pdf-spotlight-body">
                      <div className="pdf-spotlight-metrics pdf-spotlight-metrics--simple">
                        <div className="m">
                          <div className="k">Spot</div>
                          <div className="v">${formatNumber(s.spotPrice, 2)}</div>
                        </div>
                        <div className="m">
                          <div className="k">{computed.triggerLabel}</div>
                          <div className="v">${formatNumber(triggerPrice, 2)}</div>
                        </div>
                        <div className="m">
                          <div className="k">Ref</div>
                          <div className="v">${formatNumber(ref, 2)}</div>
                        </div>
                      </div>
                      <div className="pdf-sparkline-wrap">
                        <div className="k">Price (norm)</div>
                        <div className="pdf-sparkline">
                          {spark ? (
                            <svg viewBox={`0 0 ${spark.w} ${spark.h}`} width={spark.w} height={spark.h} aria-label="Price sparkline">
                              <defs>
                                <linearGradient id={`sparkFill-${s.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.28" />
                                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
                                </linearGradient>
                              </defs>
                              <path d={areaD} fill={`url(#sparkFill-${s.symbol})`} stroke="none" />
                              <path d={pathD} fill="none" stroke="#14b8a6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                              {endDot && (
                                <>
                                  <circle cx={endDot.x} cy={endDot.y} r="4.8" fill="rgba(20,184,166,0.25)" />
                                  <circle cx={endDot.x} cy={endDot.y} r="3.2" fill="#14b8a6" />
                                  <circle cx={endDot.x} cy={endDot.y} r="1.6" fill="#ffffff" />
                                </>
                              )}
                            </svg>
                          ) : (
                            <div className="pdf-mini pdf-muted">—</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ height: 6 }} />

          {/* Understand the scenarios */}
          <div className="pdf-card avoid-break" style={{ width: '100%' }}>
            <div className="pdf-section-title">Understand the scenarios</div>
            <div className="pdf-grid-2-eq" style={{ width: '100%' }}>
              <div className="pdf-card pdf-card--inner" style={{ padding: 8, borderColor: 'rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <b style={{ color: 'var(--pdf-ink)' }}>If final ≥ {formatPercent(computed.triggerPct, 0)}</b>
                  <span className="pdf-pill good">YES</span>
                </div>
                <div className="pdf-mini pdf-muted">
                  <div>• Cash redemption: 100% notional</div>
                  <div>• Coupons paid as scheduled</div>
                  <div style={{ marginTop: 4, color: 'var(--pdf-faint)' }}>
                    Payoff ≈ 100% (+ coupons)
                  </div>
                </div>
              </div>
              <div className="pdf-card pdf-card--inner" style={{ padding: 8, borderColor: 'rgba(239,68,68,0.30)', background: 'rgba(239,68,68,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <b style={{ color: 'var(--pdf-ink)' }}>If final &lt; {formatPercent(computed.triggerPct, 0)}</b>
                  <span className="pdf-pill bad">NO</span>
                </div>
                <div className="pdf-mini pdf-muted">
                  <div>• Share conversion (physical settlement)</div>
                  <div>• Ending value follows the stock level</div>
                  <div style={{ marginTop: 4, color: 'var(--pdf-faint)' }}>
                    Shares ≈ Notional / Reference price
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 6 }} />

          <div className="pdf-card avoid-break" style={{ width: '100%' }}>
            <div className="pdf-section-title">Risks (short)</div>
            <div className="pdf-mini pdf-muted">
              <div>• Capital at risk: share delivery can be worth less than your initial investment.</div>
              <div>• Issuer credit risk: default can lead to loss of principal and coupons.</div>
              <div>• Early sale may be at a discount; these are designed to be held to maturity.</div>
            </div>
            <div style={{ marginTop: 6, fontSize: 9.5, color: 'var(--pdf-faint)' }}>
              Indicative terms • Not an offer • For information only
            </div>
          </div>

          {/* Footer */}
          <div className="pdf-footer" style={{ width: '100%' }}>
            <div className="pdf-footer-band">
              <span><b>Document ID:</b> {reportData.documentId}</span>
              <span className="pdf-muted"><b>Generated:</b> {reportData.generatedDate}</span>
              <span><b>Page</b> 2 of 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}