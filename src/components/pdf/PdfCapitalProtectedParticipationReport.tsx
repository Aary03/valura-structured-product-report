/**
 * CPPN PDF-only 2-page layout (A4)
 * Separate from Reverse Convertible PDF.
 */

import { useEffect, useMemo, useState } from 'react';
import type { CapitalProtectedParticipationReportData } from '../../hooks/useReportGenerator';
import { formatNumber } from '../../core/utils/math';
import { getLogoWithFallback } from '../../utils/logo';
import valuraLogo from '../../../Valura.ai - Logo (Black).png';
import { CppnPayoffGraph } from '../report/CppnPayoffGraph';
import { PerformanceGraph } from '../report/PerformanceGraph';
import { buildUnderlyingSummary, type UnderlyingSummary } from '../../services/underlyingSummary';
import { buildCPPNFlow } from '../scenarios/builders/buildCPPNFlow';
import { calculateCppnBreakevenLevelPct } from '../../products/capitalProtectedParticipation/breakEven';

declare global {
  interface Window {
    __PDF_READY__?: boolean;
  }
}

export function PdfCapitalProtectedParticipationReport({
  reportData,
}: {
  reportData: CapitalProtectedParticipationReportData;
}) {
  const { terms, underlyingData, historicalData, curvePoints, basketLevelPct } = reportData;

  const basketTypeForChart = terms.basketType === 'worst_of' ? 'worst_of' : 'single';

  const currentLevelPct = useMemo(() => {
    if (typeof basketLevelPct === 'number') return basketLevelPct;
    return null;
  }, [basketLevelPct]);

  const [spotlightSummaries, setSpotlightSummaries] = useState<UnderlyingSummary[]>([]);
  const [spotlightsReady, setSpotlightsReady] = useState(false);

  // Fetch spotlight summaries for PDF (keep same section structure as RC PDF)
  useEffect(() => {
    let cancelled = false;
    setSpotlightsReady(false);

    const timer = window.setTimeout(() => {
      if (!cancelled) setSpotlightsReady(true);
    }, 9000);

    (async () => {
      try {
        const thresholdPct = terms.participationStartPct / 100;
        const thresholdLabel = 'Participation Start';
        const maxCards = Math.min(2, underlyingData.length);
        const tasks = Array.from({ length: maxCards }).map(async (_v, i) => {
          const u = underlyingData[i];
          const initialFixing = u.initialFixing || u.currentPrice;
          const rawSeries = historicalData?.[i] || [];
          const hist = (rawSeries as any[])
            .map((p) => ({
              date: p.date,
              price: (p.price ?? p.close ?? p.adjClose) as number,
              normalized: (p.normalized ?? p.price ?? p.close ?? p.adjClose) as number,
            }))
            .filter((p) => typeof p.price === 'number' && p.price > 0);
          return await buildUnderlyingSummary(u.symbol, initialFixing, thresholdPct, hist as any, { thresholdLabel });
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
  }, [terms.participationStartPct, underlyingData, historicalData]);

  // Mark ready for Playwright once rendered (double RAF for charts layout)
  useEffect(() => {
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
  }, [spotlightsReady]);

  const capLabel = terms.capType === 'capped' ? `${terms.capLevelPct}%` : 'None';
  const kiLabel = terms.knockInEnabled ? `${terms.knockInLevelPct}%` : 'Off';
  const sLabel = terms.knockInEnabled ? `${terms.downsideStrikePct ?? terms.knockInLevelPct}%` : '—';
  
  // Issuer callable labels
  const callFrequencyLabel = terms.issuerCallableEnabled && terms.issuerCallFrequency
    ? terms.issuerCallFrequency.charAt(0).toUpperCase() + terms.issuerCallFrequency.slice(1)
    : 'No';
  const exitRateLabel = terms.issuerCallableEnabled && terms.exitRatePA
    ? `${formatNumber(terms.exitRatePA, 2)}%`
    : '—';
    
  // Format basket type for display
  const basketLabel = terms.basketType === 'worst_of' 
    ? 'Worst Of' 
    : terms.basketType === 'best_of'
    ? 'Best Of'
    : terms.basketType === 'single'
    ? 'Single'
    : 'Average';
  
  // Calculate break-even
  const breakEvenResult = useMemo(() => calculateCppnBreakevenLevelPct(terms), [terms]);

  const scenarioLevels = terms.capType === 'capped' ? [70, 90, 100, 120, 140, 160] : [70, 90, 100, 120, 140, 160];
  const a = terms.participationRatePct / 100;

  const payoffAt = (X: number) => {
    // Match engine math for the report table
    // BONUS CERTIFICATE LOGIC
    if (terms.bonusEnabled && terms.bonusLevelPct && terms.bonusBarrierPct) {
      const barrierBreached = X < terms.bonusBarrierPct;
      if (barrierBreached) {
        // Barrier breached: 1:1 with underlying
        return 100 * (X / 100); // R = X/100, so 100*R = X
      } else {
        // Barrier not breached: bonus floor + participation
        const K = terms.participationStartPct;
        const R = X / 100;
        const P = 100 + 100 * a * Math.max(0, R - (K / 100));
        const P_capped = terms.capType === 'capped' && terms.capLevelPct 
          ? Math.min(P, terms.capLevelPct)
          : P;
        return Math.max(terms.bonusLevelPct, P_capped);
      }
    }
    
    // STANDARD CPPN LOGIC
    if (terms.knockInEnabled && typeof terms.knockInLevelPct === 'number' && X < terms.knockInLevelPct) {
      const S = terms.downsideStrikePct ?? terms.knockInLevelPct;
      return (100 * X) / S;
    }
    const P = terms.capitalProtectionPct;
    const K = terms.participationStartPct;
    const delta = terms.participationDirection === 'up' ? Math.max(0, X - K) : Math.max(0, K - X);
    const cappedDelta =
      terms.capType === 'capped' && typeof terms.capLevelPct === 'number'
        ? Math.min(delta, Math.max(0, terms.capLevelPct - K))
        : delta;
    return Math.max(P, P + a * cappedDelta);
  };

  const sparklineForIndex = (idx: number) => {
    const raw = (historicalData?.[idx] || []) as any[];
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
    return { coords, w, h, last: sampled[sampled.length - 1] };
  };

  return (
    <div className="pdf-root" data-pdf-ready={String(!!window.__PDF_READY__)}>
      {/* PAGE 1 */}
      <div className="pdf-page">
        <div className="pdf-sheet">
          <div className="pdf-topbar avoid-break" />
          <div style={{ height: 8 }} />

          <div className="pdf-card pdf-product-card avoid-break">
            <div className="pdf-brand">
              <img src={valuraLogo} alt="Valura.ai" className="pdf-brand-img" />
              <span className="pdf-sub">Structured Product Report</span>
            </div>

            <div style={{ marginTop: 6 }}>
              <div className="pdf-product-title">
                {terms.bonusEnabled ? 'Bonus Certificate' : 'Capital Protected Participation Note'}
              </div>
              <div className="pdf-product-rate">
                {terms.bonusEnabled 
                  ? `Bonus: ${terms.bonusLevelPct}% if barrier (${terms.bonusBarrierPct}%) not breached`
                  : `${terms.capitalProtectionPct}% protected floor`}
              </div>
            </div>

            <div className="pdf-chip-row">
              {underlyingData.map((u) => {
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
            </div>

            <div className="pdf-chip-row" style={{ marginTop: 6 }}>
              <span className="pdf-chip">{terms.currency}</span>
              <span className="pdf-chip">{terms.tenorMonths}M Tenor</span>
              <span className="pdf-chip">{basketLabel} Basket</span>
              {terms.bonusEnabled ? (
                <>
                  <span className="pdf-chip">{terms.bonusLevelPct}% Bonus</span>
                  <span className="pdf-chip">{terms.bonusBarrierPct}% Barrier</span>
                  <span className="pdf-chip">{terms.participationStartPct}% Strike</span>
                  <span className="pdf-chip">{terms.participationRatePct}% Participation</span>
                  {terms.capType === 'capped' && <span className="pdf-chip">Cap: {terms.capLevelPct}%</span>}
                </>
              ) : (
                <>
                  <span className="pdf-chip">{terms.participationRatePct}% Participation</span>
                  <span className="pdf-chip">{terms.participationStartPct}% Starts at</span>
                  {terms.capType === 'capped' && terms.capLevelPct ? (
                    <span className="pdf-chip">Cap: {terms.capLevelPct}%</span>
                  ) : (
                    <span className="pdf-chip">No Cap</span>
                  )}
                  {terms.knockInEnabled && (
                    <span className="pdf-chip">KI: {terms.knockInLevelPct}%</span>
                  )}
                </>
              )}
              {terms.issuerCallableEnabled && (
                <span className="pdf-chip">{callFrequencyLabel} Callable</span>
              )}
            </div>

            <div className="pdf-spec-grid">
              {terms.bonusEnabled ? (
                <>
                  <div className="pdf-spec-item">
                    <div className="k">Bonus Level</div>
                    <div className="v">{terms.bonusLevelPct}%</div>
                  </div>
                  <div className="pdf-spec-item">
                    <div className="k">Bonus Barrier</div>
                    <div className="v">{terms.bonusBarrierPct}%</div>
                  </div>
                  <div className="pdf-spec-item">
                    <div className="k">Strike</div>
                    <div className="v">{terms.participationStartPct}%</div>
                  </div>
                  <div className="pdf-spec-item">
                    <div className="k">Participation Rate</div>
                    <div className="v">{terms.participationRatePct}%</div>
                  </div>
                  <div className="pdf-spec-item">
                    <div className="k">Cap</div>
                    <div className="v">{capLabel}</div>
                  </div>
                </>
              ) : (
                <>
                  {terms.capitalProtectionPct > 0 && (
                    <div className="pdf-spec-item">
                      <div className="k">Capital protection</div>
                      <div className="v">{terms.capitalProtectionPct}%</div>
                    </div>
                  )}
                  <div className="pdf-spec-item">
                    <div className="k">Participation rate</div>
                    <div className="v">{terms.participationRatePct}%</div>
                  </div>
                  <div className="pdf-spec-item">
                    <div className="k">Participation starts</div>
                    <div className="v">{terms.participationStartPct}%</div>
                  </div>
                  <div className="pdf-spec-item">
                    <div className="k">Direction</div>
                    <div className="v">{terms.participationDirection === 'up' ? 'Upside' : 'Downside'}</div>
                  </div>
                  <div className="pdf-spec-item">
                    <div className="k">Cap</div>
                    <div className="v">{capLabel}</div>
                  </div>
                  <div className="pdf-spec-item">
                    <div className="k">Knock-in</div>
                    <div className="v">{kiLabel}</div>
                  </div>
                </>
              )}
              {terms.issuerCallableEnabled && (
                <>
                  <div className="pdf-spec-item">
                    <div className="k">Issuer Callable</div>
                    <div className="v">{callFrequencyLabel}</div>
                  </div>
                  <div className="pdf-spec-item">
                    <div className="k">Exit Rate (p.a.)</div>
                    <div className="v">{exitRateLabel}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ height: 8 }} />

          <div className="avoid-break">
            <CppnPayoffGraph
              curvePoints={curvePoints}
              capitalProtectionPct={terms.capitalProtectionPct}
              participationStartPct={terms.participationStartPct}
              capType={terms.capType}
              capLevelPct={terms.capLevelPct}
              knockInEnabled={terms.knockInEnabled}
              knockInLevelPct={terms.knockInLevelPct}
              downsideStrikePct={terms.downsideStrikePct ?? terms.knockInLevelPct}
              currentLevelPct={currentLevelPct}
              bonusEnabled={terms.bonusEnabled}
              pdfMode
            />
          </div>

          <div style={{ height: 8 }} />

          <div className="pdf-card avoid-break">
            <div className="pdf-section-title">More about the underlyings</div>
            <table className="pdf-table">
              <thead>
                <tr>
                  <th>Underlying</th>
                  <th>Spot</th>
                  <th>Reference</th>
                  <th>Start (K)</th>
                  {terms.knockInEnabled && <th>KI</th>}
                </tr>
              </thead>
              <tbody>
                {underlyingData.map((u, i) => {
                  const ref = reportData.referencePrices?.[i] ?? u.currentPrice;
                  const kPrice = ref * (terms.participationStartPct / 100);
                  const kiPrice =
                    terms.knockInEnabled && terms.knockInLevelPct != null
                      ? ref * (terms.knockInLevelPct / 100)
                      : null;
                  return (
                  <tr key={u.symbol}>
                    <td>
                      <div className="pdf-td-underlying">
                        <span className="pdf-inline-logo">
                          <img
                            src={getLogoWithFallback(u.symbol, u.name).logoUrl}
                            alt={u.symbol}
                            onError={(e) => {
                              const img = e.currentTarget;
                              img.style.display = 'none';
                            }}
                          />
                        </span>
                        <b style={{ color: 'var(--pdf-ink)' }}>{u.symbol}</b>
                      </div>
                    </td>
                    <td>${formatNumber(u.currentPrice, 2)}</td>
                    <td>${formatNumber(reportData.referencePrices?.[i] ?? u.currentPrice, 2)}</td>
                    <td>${formatNumber(kPrice, 2)}</td>
                    {terms.knockInEnabled && <td>{kiPrice == null ? '—' : `$${formatNumber(kiPrice, 2)}`}</td>}
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ height: 8 }} />
          
          {/* Issuer Callable Section */}
          {terms.issuerCallableEnabled && (
            <>
              <div className="pdf-card avoid-break" style={{ borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.06)' }}>
                <div className="pdf-section-title" style={{ marginBottom: 8 }}>Issuer Callability</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div className="pdf-mini" style={{ color: 'var(--pdf-faint)', marginBottom: 4 }}>Issuer Call Frequency</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--pdf-ink)' }}>{callFrequencyLabel}</div>
                  </div>
                  <div>
                    <div className="pdf-mini" style={{ color: 'var(--pdf-faint)', marginBottom: 4 }}>Exit Rate Per Annum</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--pdf-ink)' }}>{exitRateLabel}</div>
                  </div>
                </div>
                
                {/* Call Flowchart */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 10, color: 'var(--pdf-ink)', marginBottom: 8 }}>
                    At each Observation Date
                  </div>
                  
                  {/* Decision Box */}
                  <div style={{ 
                    border: '2px dashed #3b82f6', 
                    background: 'rgba(59, 130, 246, 0.08)', 
                    borderRadius: 8, 
                    padding: '10px',
                    textAlign: 'center',
                    marginBottom: 10
                  }}>
                    <div className="pdf-mini" style={{ fontWeight: 700, color: 'var(--pdf-ink)' }}>
                      Has the issuer called the product?
                    </div>
                  </div>
                  
                  {/* YES / NO Outcomes */}
                  <div className="pdf-grid-2-eq">
                    <div style={{ 
                      border: '2px solid #10b981', 
                      background: 'rgba(16, 185, 129, 0.08)', 
                      borderRadius: 8, 
                      padding: 10
                    }}>
                      <div style={{ fontWeight: 800, fontSize: 10, color: '#10b981', marginBottom: 6 }}>
                        YES
                      </div>
                      <div className="pdf-mini pdf-muted">
                        <div>Product early redeems and pays {terms.capitalProtectionPct}% of invested capital plus an Exit Rate of {exitRateLabel} per annum</div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      border: '2px solid #6b7280', 
                      background: 'rgba(107, 114, 128, 0.08)', 
                      borderRadius: 8, 
                      padding: 10
                    }}>
                      <div style={{ fontWeight: 800, fontSize: 10, color: '#6b7280', marginBottom: 6 }}>
                        NO
                      </div>
                      <div className="pdf-mini pdf-muted">
                        <div>Product continues to next observation date</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ height: 8 }} />
            </>
          )}

          {/* Good fit + Break-even (keep same section structure as RC PDF) */}
          <div className="pdf-grid-2-eq">
            <div className="pdf-card avoid-break" style={{ borderColor: 'rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.06)' }}>
              <div className="pdf-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Good fit if…</span>
                <span className="pdf-pill good">Good fit</span>
              </div>
              <div className="pdf-mini pdf-muted">
                {terms.bonusEnabled ? (
                  <>
                    <div>• You want bonus return if barrier not breached</div>
                    <div>• You can hold to maturity</div>
                    <div>• You accept downside risk if barrier breached</div>
                  </>
                ) : (
                  <>
                    <div>• You want a protected floor with defined participation</div>
                    <div>• You can hold to maturity</div>
                    <div>• You accept issuer credit risk</div>
                  </>
                )}
              </div>
            </div>
            <div className="pdf-card avoid-break" style={{ borderColor: 'rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.08)' }}>
              <div className="pdf-section-title" style={{ marginBottom: 4 }}>Break-even / Minimum</div>
              <div className="pdf-mini pdf-muted">
                {/* Bonus Certificate */}
                {breakEvenResult.kind === 'bonus_conditional' && (
                  <>
                    <div style={{ marginBottom: 6 }}>
                      <b style={{ color: 'var(--pdf-ink)' }}>If barrier not breached:</b> Minimum {formatNumber(breakEvenResult.bonusFloorPct, 1)}% (bonus floor)
                    </div>
                    <div>
                      <b style={{ color: 'var(--pdf-ink)' }}>If barrier breached:</b> Payoff follows underlying 1:1 (potential loss)
                    </div>
                    <div style={{ marginTop: 6, fontSize: 9, color: 'var(--pdf-faint)' }}>
                      Barrier level: {formatNumber(breakEvenResult.barrierPct, 1)}% • Must never touch during product life
                    </div>
                  </>
                )}
                
                {/* Always Profitable */}
                {breakEvenResult.kind === 'always' && (
                  <>
                    <div style={{ marginBottom: 6 }}>
                      <b style={{ color: 'var(--pdf-ink)' }}>Minimum redemption: {formatNumber(breakEvenResult.minReturnPct, 1)}%</b>
                    </div>
                    <div>
                      {breakEvenResult.reason} • Always profitable at maturity.
                    </div>
                  </>
                )}
                
                {/* Standard Break-even Level */}
                {breakEvenResult.kind === 'level' && (
                  <>
                    <div style={{ marginBottom: 6 }}>
                      <b style={{ color: 'var(--pdf-ink)' }}>Break-even level: {formatNumber(breakEvenResult.levelPct, 1)}%</b>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      Above {formatNumber(breakEvenResult.levelPct, 1)}%: positive return • Below: loss down to {formatNumber(breakEvenResult.floorPct, 1)}% floor
                    </div>
                    <div style={{ fontSize: 9.5, color: 'var(--pdf-ink)', background: 'rgba(255,255,255,0.4)', padding: '6px 8px', borderRadius: 6, marginTop: 6 }}>
                      <b>Formula:</b> <span className="pdf-mono">BE = {formatNumber(terms.participationStartPct, 0)}% + ({formatNumber(100 - terms.capitalProtectionPct, 0)} / {formatNumber(terms.participationRatePct / 100, 2)}) = {formatNumber(breakEvenResult.levelPct, 1)}%</span>
                    </div>
                  </>
                )}
                
                {/* Impossible to Break Even */}
                {breakEvenResult.kind === 'impossible' && (
                  <>
                    <div style={{ marginBottom: 6 }}>
                      <b style={{ color: 'var(--pdf-ink)' }}>Cannot reach 100% return</b>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      Maximum redemption: <b style={{ color: 'var(--pdf-ink)' }}>{formatNumber(breakEvenResult.maxReturnPct ?? 0, 1)}%</b>
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--pdf-faint)' }}>
                      {breakEvenResult.reason}
                    </div>
                  </>
                )}
                
                {/* Knock-in Conditional */}
                {breakEvenResult.kind === 'knock_in_conditional' && (
                  <>
                    <div style={{ marginBottom: 6 }}>
                      <b style={{ color: 'var(--pdf-ink)' }}>Conditional break-even:</b>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      {breakEvenResult.protectedBreakevenPct !== null ? (
                        <>
                          If final ≥ {formatNumber(breakEvenResult.knockInLevelPct, 0)}%: break-even at <b style={{ color: 'var(--pdf-ink)' }}>{formatNumber(breakEvenResult.protectedBreakevenPct, 1)}%</b>
                        </>
                      ) : (
                        <>
                          If final ≥ {formatNumber(breakEvenResult.knockInLevelPct, 0)}%: always get ≥ {formatNumber(breakEvenResult.capitalProtectionPct, 0)}%
                        </>
                      )}
                    </div>
                    <div>
                      If final &lt; {formatNumber(breakEvenResult.knockInLevelPct, 0)}% (knock-in): payoff switches to geared-put formula (1:1 downside exposure)
                    </div>
                    <div style={{ marginTop: 6, fontSize: 9, color: 'var(--pdf-faint)' }}>
                      Protection only valid if knock-in never triggered
                    </div>
                  </>
                )}
                
                {/* Additional Knock-in Warning (for any type with KI) */}
                {!terms.bonusEnabled && terms.knockInEnabled && breakEvenResult.kind !== 'knock_in_conditional' && (
                  <div style={{ marginTop: 6, fontSize: 9.5, background: 'rgba(239,68,68,0.1)', padding: '6px 8px', borderRadius: 6, color: 'var(--pdf-ink)' }}>
                    ⚠️ Knock-in at {formatNumber(terms.knockInLevelPct ?? 0, 0)}%: if breached, protection lost and payoff = 100·(X/S)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pdf-footer">
            <div className="pdf-footer-band">
              <span><b>Document ID:</b> {reportData.documentId}</span>
              <span className="pdf-muted"><b>Generated:</b> {reportData.generatedDate}</span>
              <span><b>Page</b> 1 of 2</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="pdf-page">
        <div className="pdf-sheet">
          <div className="pdf-topbar avoid-break" />
          <div style={{ height: 8 }} />

          <div className="pdf-grid-2">
            <div className="avoid-break">
              <PerformanceGraph
                historicalData={historicalData}
                underlyingSymbols={underlyingData.map((u) => u.symbol)}
                barrierLevel={0}
                strikeLevel={undefined}
                initialFixings={{}}
                basketType={basketTypeForChart}
                worstUnderlyingIndex={null}
                pdfMode
              />
            </div>

            <div className="pdf-card avoid-break">
              <div className="pdf-section-title">If you invest ${formatNumber(terms.notional, 0)}</div>
              <table className="pdf-table">
                <thead>
                  <tr>
                    <th>Final level (X)</th>
                    <th style={{ textAlign: 'right' }}>Payoff (%)</th>
                    <th style={{ textAlign: 'right' }}>Redemption</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioLevels.map((X) => {
                    const payoffPct = payoffAt(X);
                    const redemption = (terms.notional * payoffPct) / 100;
                    return (
                      <tr key={X}>
                        <td><b style={{ color: 'var(--pdf-ink)' }}>{X}%</b></td>
                        <td style={{ textAlign: 'right', color: 'var(--pdf-ink)' }}>{formatNumber(payoffPct, 1)}%</td>
                        <td style={{ textAlign: 'right', color: 'var(--pdf-ink)' }}>${formatNumber(redemption, 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ height: 8 }} />

              <div className="pdf-card pdf-card--inner avoid-break" style={{ padding: 10, borderColor: 'rgba(79,70,229,0.22)', background: 'rgba(79,70,229,0.06)' }}>
                <div className="pdf-section-title" style={{ marginBottom: 4 }}>Formula</div>
                <div className="pdf-mini pdf-muted">
                  {terms.bonusEnabled ? (
                    <>
                      If barrier ({formatNumber(terms.bonusBarrierPct, 0)}%) <b>not breached</b>:
                      <div style={{ marginTop: 4 }}>
                        <span className="pdf-mono">RED = max(BL, 100 + 100·a·max(0, X−K))</span>
                        {terms.capType === 'capped' && <> (capped at {formatNumber(terms.capLevelPct, 0)}%)</>}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        If barrier <b>breached</b>: <span className="pdf-mono">RED = 100·R</span> (1:1 with underlying)
                      </div>
                    </>
                  ) : (
                    <>
                      Protected regime: <span className="pdf-mono">max(P, P + a·max(0, ±(X−K)))</span>
                      {terms.capType === 'capped' && <> (capped)</>}
                      {terms.knockInEnabled && (
                        <>
                          <div style={{ marginTop: 6 }}>
                            If <b>X &lt; KI</b>: <span className="pdf-mono">100·(X/S)</span>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 6 }} />

          {/* Underlying spotlights (keep same section as RC PDF) */}
          <div>
            <div className="pdf-section-title" style={{ marginBottom: 6 }}>Underlying spotlights</div>
            <div className="pdf-spotlight-grid pdf-spotlight-grid-1">
              {(spotlightSummaries.length > 0 ? spotlightSummaries : []).map((s, idx) => {
                const spark = sparklineForIndex(idx);
                const u = underlyingData[idx];
                const ref = reportData.referencePrices?.[idx] ?? u.currentPrice;
                const kPrice = ref * (terms.participationStartPct / 100);
                const perfTone = s.performancePct >= 0 ? 'good' : 'bad';
                const pathD = spark
                  ? `M ${spark.coords.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')}`
                  : '';
                const areaD = spark
                  ? `M 0 ${spark.h} L ${spark.coords.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')} L ${spark.w} ${spark.h} Z`
                  : '';
                const endDot = spark ? spark.coords[spark.coords.length - 1] : null;

                return (
                  <div key={s.symbol} className="pdf-underlying-card pdf-spotlight-card avoid-break">
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
                          <span className="pdf-logo-fallback">{s.symbol.slice(0, 2)}</span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="pdf-underlying-symbol">{s.symbol}</div>
                          <div className="pdf-underlying-name">{s.name}</div>
                        </div>
                      </div>
                      <div className="pdf-spotlight-badges">
                        <span className={`pdf-pill ${perfTone}`}>
                          {s.performancePct >= 0 ? '▲' : '▼'} {formatNumber(Math.abs(s.performancePct), 1)}%
                        </span>
                      </div>
                    </div>

                    <div className="pdf-spotlight-body">
                      <div className="pdf-spotlight-metrics pdf-spotlight-metrics--simple">
                        <div className="m">
                          <div className="k">Spot</div>
                          <div className="v">${formatNumber(s.spotPrice, 2)}</div>
                        </div>
                        <div className="m">
                          <div className="k">Ref</div>
                          <div className="v">${formatNumber(ref, 2)}</div>
                        </div>
                        <div className="m">
                          <div className="k">Start (K)</div>
                          <div className="v">${formatNumber(kPrice, 2)}</div>
                        </div>
                        <div className="m">
                          <div className="k">Sector</div>
                          <div className="v">{s.sector || '—'}</div>
                          <div className="pdf-mini pdf-muted" style={{ marginTop: 2 }}>
                            {s.industry || ''}
                          </div>
                        </div>
                      </div>
                      <div className="pdf-sparkline-wrap">
                        <div className="k">Price history (normalized)</div>
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
                        <div className="pdf-mini pdf-muted" style={{ marginTop: 4 }}>
                          Latest: <b style={{ color: 'var(--pdf-ink)' }}>{spark ? `${formatNumber(spark.last, 0)}%` : '—'}</b>
                        </div>
                      </div>

                      {/* Company Description - AI Summary */}
                      {(s.descriptionSummary || s.description) && (
                        <div className="pdf-company-description">
                          <div className="pdf-description-header">
                            <b>About {s.symbol}</b>
                            {s.ceo && <span style={{ marginLeft: 8 }}>• CEO: {s.ceo}</span>}
                          </div>
                          <div className="pdf-description-text">
                            {s.descriptionSummary || s.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ height: 8 }} />

          {/* Understand the Scenarios - Enhanced Flowchart (Multiple Nodes) */}
          {(() => {
            const scenarioFlow = buildCPPNFlow(terms);
            return (
              <div style={{ marginBottom: 10 }}>
                <div className="pdf-section-title" style={{ marginBottom: 10 }}>Understand the Scenarios</div>
                <div className="pdf-mini pdf-muted" style={{ marginBottom: 10 }}>
                  {scenarioFlow.subtitle}
                </div>

                {/* Loop through all scenario nodes */}
                {scenarioFlow.nodes.map((node, nodeIndex) => {
                  // Determine if YES is good or bad based on node ID and content
                  const isKnockInQuestion = node.id === 'cppn-ki';
                  const isBonusBarrierQuestion = node.id === 'bonus-barrier';
                  
                  // For knock-in: YES (stocks fell) = BAD, NO (stayed above) = GOOD
                  // For participation upside: YES (went up) = GOOD, NO (stayed flat) = depends
                  // For bonus barrier: YES (stayed above) = GOOD, NO (breached) = BAD
                  const yesIsGood = !isKnockInQuestion; // Knock-in is the only case where YES is bad
                  
                  const yesColor = yesIsGood ? '#10b981' : '#f59e0b'; // Green if good, amber if bad
                  const yesBg = yesIsGood ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)';
                  const noColor = yesIsGood ? '#f97316' : '#10b981'; // Orange if YES was good, green if YES was bad
                  const noBg = yesIsGood ? 'rgba(249, 115, 22, 0.08)' : 'rgba(16, 185, 129, 0.08)';
                  
                  return (
                    <div key={node.id} style={{ marginBottom: nodeIndex < scenarioFlow.nodes.length - 1 ? 12 : 0 }}>
                      {/* Decision Question Box */}
                      <div style={{ 
                        border: '3px dashed #8b5cf6', 
                        background: 'rgba(139, 92, 246, 0.08)', 
                        borderRadius: 12, 
                        padding: '10px 12px',
                        textAlign: 'center',
                        marginBottom: 10
                      }}>
                        <div style={{ fontWeight: 800, fontSize: 11.5, color: 'var(--pdf-ink)', marginBottom: 4 }}>
                          {node.condition}
                        </div>
                        {node.metaChips && node.metaChips.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                            {node.metaChips.map((chip, i) => (
                              <span key={i} className="pdf-pill" style={{ fontSize: 9, padding: '2px 8px' }}>
                                {chip}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* YES / NO Outcome Boxes */}
                      <div className="pdf-grid-2-eq">
                        {/* YES Outcome */}
                        <div style={{ 
                          border: `3px solid ${yesColor}`, 
                          background: yesBg, 
                          borderRadius: 12, 
                          padding: 10,
                          position: 'relative'
                        }}>
                          <div style={{ 
                            position: 'absolute', 
                            left: 0, 
                            top: 0, 
                            bottom: 0, 
                            width: 28,
                            background: yesColor,
                            borderRadius: '12px 0 0 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 900,
                            fontSize: 11,
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)'
                          }}>
                            YES
                          </div>
                          <div style={{ marginLeft: 32 }}>
                            <div style={{ fontWeight: 800, fontSize: 11, color: 'var(--pdf-ink)', marginBottom: 6 }}>
                              {node.yes.title}
                            </div>
                            <div className="pdf-mini pdf-muted" style={{ lineHeight: 1.5 }}>
                              {node.yes.lines.map((line, i) => (
                                <div key={i}>{line}</div>
                              ))}
                            </div>
                            {node.yes.note && (
                              <div className="pdf-mini pdf-muted" style={{ marginTop: 6, fontStyle: 'italic', fontSize: 9, color: 'var(--pdf-faint)' }}>
                                {node.yes.note}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* NO Outcome */}
                        <div style={{ 
                          border: `3px solid ${noColor}`, 
                          background: noBg, 
                          borderRadius: 12, 
                          padding: 10,
                          position: 'relative'
                        }}>
                          <div style={{ 
                            position: 'absolute', 
                            left: 0, 
                            top: 0, 
                            bottom: 0, 
                            width: 28,
                            background: noColor,
                            borderRadius: '12px 0 0 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 900,
                            fontSize: 11,
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)'
                          }}>
                            NO
                          </div>
                          <div style={{ marginLeft: 32 }}>
                            <div style={{ fontWeight: 800, fontSize: 11, color: 'var(--pdf-ink)', marginBottom: 6 }}>
                              {node.no.title}
                            </div>
                            <div className="pdf-mini pdf-muted" style={{ lineHeight: 1.5 }}>
                              {node.no.lines.map((line, i) => (
                                <div key={i}>{line}</div>
                              ))}
                            </div>
                            {node.no.note && (
                              <div className="pdf-mini pdf-muted" style={{ marginTop: 6, fontStyle: 'italic', fontSize: 9, color: 'var(--pdf-faint)' }}>
                                {node.no.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <div style={{ height: 8 }} />

          <div className="pdf-card avoid-break">
            <div className="pdf-section-title">Risks (short)</div>
            <div className="pdf-mini pdf-muted">
              {terms.bonusEnabled ? (
                <>
                  <div>• Barrier risk: if barrier ({formatNumber(terms.bonusBarrierPct, 0)}%) breached, bonus protection is lost.</div>
                  <div>• Downside exposure: if barrier breached, payoff follows underlying (1:1), potential for loss.</div>
                  <div>• Liquidity risk: secondary market price may be below notional before maturity.</div>
                  <div>• Issuer credit risk: depends on issuer ability to pay at maturity.</div>
                </>
              ) : (
                <>
                  <div>• Issuer credit risk: "capital protection" depends on issuer ability to pay.</div>
                  <div>• Liquidity risk: secondary market price may be below notional before maturity.</div>
                  <div>• Knock-in (if enabled) can increase downside exposure at maturity.</div>
                </>
              )}
            </div>
            <div style={{ marginTop: 8, fontSize: 9.5, color: 'var(--pdf-faint)' }}>
              Indicative terms • Not an offer • For information only
            </div>
          </div>

          {/* Footer */}
          <div className="pdf-footer">
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


