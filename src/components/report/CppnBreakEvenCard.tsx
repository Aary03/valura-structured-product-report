/**
 * CPPN Break-even Card
 * Comprehensive break-even display for all structured product types:
 * - Standard CPPN (full/partial protection)
 * - Bonus Certificates (conditional break-even)
 * - Knock-in products (two-regime break-even)
 * - Capped products
 * - All combinations
 */

import type { CapitalProtectedParticipationTerms } from '../../products/capitalProtectedParticipation/terms';
import { calculateCppnBreakevenLevelPct } from '../../products/capitalProtectedParticipation/breakEven';
import { CardShell } from '../common/CardShell';
import { SectionHeader } from '../common/SectionHeader';
import { formatNumber } from '../../core/utils/math';
import { Target, AlertCircle, Shield, TrendingUp, Gift, ArrowDown, ArrowUp, Sparkles } from 'lucide-react';

export function CppnBreakEvenCard({ terms }: { terms: CapitalProtectedParticipationTerms }) {
  const be = calculateCppnBreakevenLevelPct(terms);
  const isBonusCertificate = terms.bonusEnabled && terms.bonusLevelPct != null;
  const isDownsideParticipation = terms.participationDirection === 'down';
  const hasCap = terms.capType === 'capped' && terms.capLevelPct != null;

  return (
    <CardShell className="p-6">
      <SectionHeader
        title="Break-Even Analysis"
        subtitle="When do you start making money at maturity?"
      />

      <div className="mt-6 space-y-4">
        {/* ========================================== */}
        {/* BONUS CERTIFICATE: Conditional (Bonus >= 100%) */}
        {/* ========================================== */}
        {be.kind === 'bonus_conditional' && (
          <>
            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-valura-mint-100 via-valura-mint-50 to-white rounded-xl border-2 border-valura-mint-400 shadow-md">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Gift className="w-7 h-7 text-valura-mint-600" />
                </div>
                <div>
                  <div className="text-xs text-valura-mint-700 font-semibold mb-1 uppercase tracking-wide">Breakeven Level</div>
                  <div className="text-4xl font-extrabold text-valura-mint-900">
                    {formatNumber(be.bonusFloorPct, 1)}%
                  </div>
                  <div className="text-xs text-valura-mint-600 mt-1 font-medium">
                    Always profitable (if barrier not breached)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-valura-mint-700 font-semibold mb-1 uppercase tracking-wide">Bonus Floor</div>
                <div className="text-2xl font-bold text-valura-ink">
                  {formatNumber(be.bonusFloorPct, 0)}%
                </div>
                <div className="text-xs text-success-fg mt-1 font-semibold">
                  +{formatNumber(be.bonusFloorPct - 100, 1)}% gain
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-valura-mint-50 to-white rounded-xl border border-valura-mint-300">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-valura-mint-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-valura-mint-600 flex-shrink-0" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-valura-ink text-base mb-2">
                    🎁 You're Always Profitable!
                  </div>
                  <div className="text-sm text-muted space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="text-success-fg mt-0.5">✓</div>
                      <div>
                        <span className="font-semibold text-valura-ink">If stocks stay above {formatNumber(be.barrierPct, 0)}%</span> throughout the entire period → 
                        You receive at least <span className="font-bold text-success-fg">{formatNumber(be.bonusFloorPct, 0)}%</span> guaranteed!
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="text-success-fg mt-0.5">✓</div>
                      <div>
                        <span className="font-semibold text-valura-ink">Below {terms.participationStartPct}%:</span> Flat {formatNumber(be.bonusFloorPct, 0)}% bonus
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="text-success-fg mt-0.5">✓</div>
                      <div>
                        <span className="font-semibold text-valura-ink">Above {terms.participationStartPct}%:</span> {formatNumber(be.bonusFloorPct, 0)}% OR stock gains ({formatNumber(terms.participationRatePct, 0)}% participation) – whichever is higher
                      </div>
                    </div>
                    {hasCap && (
                      <div className="flex items-start space-x-2">
                        <div className="text-warning-fg mt-0.5">⚠</div>
                        <div>
                          <span className="font-semibold text-valura-ink">Upside capped at {formatNumber(terms.capLevelPct!, 0)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-red-50 to-white rounded-xl border-2 border-red-300">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-red-900 text-base mb-2">
                    ⚠️ Critical: Don't Touch {formatNumber(be.barrierPct, 0)}% Barrier!
                  </div>
                  <div className="text-sm text-red-800 space-y-1">
                    <div>
                      If stocks drop to <span className="font-bold">{formatNumber(be.barrierPct, 0)}%</span> at ANY point during the product life, 
                      you lose the {formatNumber(be.bonusFloorPct, 0)}% bonus protection.
                    </div>
                    <div className="mt-2 pt-2 border-t border-red-200">
                      After breach: You track the stock 1-to-1 (like owning it) with full downside exposure.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================== */}
        {/* ALWAYS PROFITABLE: Full Capital Protection */}
        {/* ========================================== */}
        {be.kind === 'always' && (
          <>
            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-green-100 via-green-50 to-white rounded-xl border-2 border-green-400 shadow-md">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Shield className="w-7 h-7 text-success-fg" />
                </div>
                <div>
                  <div className="text-xs text-green-700 font-semibold mb-1 uppercase tracking-wide">Break-Even Status</div>
                  <div className="text-3xl font-extrabold text-success-fg">
                    Always Profitable ✓
                  </div>
                  <div className="text-xs text-green-700 mt-1 font-medium">
                    {be.minReturnPct >= 100 ? 'No risk of loss' : `Minimum ${formatNumber(be.minReturnPct, 0)}% return`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-green-700 font-semibold mb-1 uppercase tracking-wide">Protected Floor</div>
                <div className="text-2xl font-bold text-valura-ink">
                  {formatNumber(be.minReturnPct, 0)}%
                </div>
                {hasCap && (
                  <div className="text-xs text-warning-fg mt-1 font-semibold">
                    Capped at {formatNumber(terms.capLevelPct!, 0)}%
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-success-fg mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted">
                  <div className="font-semibold text-text-primary mb-1">Capital Protection Active</div>
                  <div>
                    Your investment is protected at <span className="font-semibold">{formatNumber(be.minReturnPct, 0)}%</span>. 
                    You will receive at least this amount at maturity (issuer dependent).
                    {isDownsideParticipation && (
                      <span className="block mt-1">
                        With downside participation, you earn more when the market declines.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================== */}
        {/* STANDARD LEVEL: Partial Protection or Bonus < 100% */}
        {/* ========================================== */}
        {be.kind === 'level' && (
          <>
            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-amber-100 via-amber-50 to-white rounded-xl border-2 border-amber-400 shadow-md">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Target className="w-7 h-7 text-warning-fg" />
                </div>
                <div>
                  <div className="text-xs text-amber-700 font-semibold mb-1 uppercase tracking-wide">Breakeven Level (X)</div>
                  <div className="text-4xl font-extrabold text-warning-fg">
                    {formatNumber(be.levelPct, 1)}%
                  </div>
                  <div className="text-xs text-amber-700 mt-1 font-medium">
                    {isDownsideParticipation ? 'Profit increases below this level' : 'Profit increases above this level'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-amber-700 font-semibold mb-1 uppercase tracking-wide">
                  {isBonusCertificate ? 'Bonus Floor' : 'Protected Floor'}
                </div>
                <div className="text-2xl font-bold text-valura-ink">
                  {formatNumber(be.floorPct, 0)}%
                </div>
                {be.floorPct < 100 && (
                  <div className="text-xs text-danger-fg mt-1 font-semibold">
                    -{formatNumber(100 - be.floorPct, 1)}% risk
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start space-x-3">
                {isDownsideParticipation ? (
                  <ArrowDown className="w-5 h-5 text-warning-fg mt-0.5 flex-shrink-0" />
                ) : (
                  <ArrowUp className="w-5 h-5 text-warning-fg mt-0.5 flex-shrink-0" />
                )}
                <div className="text-sm text-muted space-y-2">
                  <div className="font-semibold text-text-primary">Break-Even Explanation</div>
                  {isDownsideParticipation ? (
                    <>
                      <div>
                        • <span className="font-semibold">Above {formatNumber(be.levelPct, 1)}%:</span> Protected at {formatNumber(be.floorPct, 0)}% (loss)
                      </div>
                      <div>
                        • <span className="font-semibold">At {formatNumber(be.levelPct, 1)}%:</span> Break even (0% return)
                      </div>
                      <div>
                        • <span className="font-semibold">Below {formatNumber(be.levelPct, 1)}%:</span> Profit from downside ({formatNumber(terms.participationRatePct, 0)}% participation)
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        • <span className="font-semibold">Below {formatNumber(be.levelPct, 1)}%:</span> Protected at {formatNumber(be.floorPct, 0)}% {be.floorPct < 100 ? '(loss)' : '(break-even)'}
                      </div>
                      <div>
                        • <span className="font-semibold">At {formatNumber(be.levelPct, 1)}%:</span> Break even (100% return)
                      </div>
                      <div>
                        • <span className="font-semibold">Above {formatNumber(be.levelPct, 1)}%:</span> Profit zone ({formatNumber(terms.participationRatePct, 0)}% participation)
                      </div>
                    </>
                  )}
                  {hasCap && (
                    <div className="pt-2 border-t border-amber-200">
                      ⚠ <span className="font-semibold">Upside capped at {formatNumber(terms.capLevelPct!, 0)}%</span> (maximum return)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isBonusCertificate && terms.bonusBarrierPct != null && (
              <div className="p-3 bg-valura-mint-50 rounded-lg border border-valura-mint-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-valura-mint-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted">
                    <div className="font-semibold text-text-primary mb-1">Bonus Certificate Condition</div>
                    <div>
                      If stocks stay above <span className="font-semibold">{formatNumber(terms.bonusBarrierPct, 0)}%</span> throughout the product life, 
                      you break even at <span className="font-semibold">{formatNumber(be.levelPct, 1)}%</span>.
                      If barrier is touched, bonus protection is lost and you track stock 1-to-1.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================== */}
        {/* KNOCK-IN CONDITIONAL: Two Regimes */}
        {/* ========================================== */}
        {be.kind === 'knock_in_conditional' && (
          <>
            <div className="p-5 bg-gradient-to-br from-blue-100 via-blue-50 to-white rounded-xl border-2 border-blue-400 shadow-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="font-bold text-lg text-valura-ink">
                  Conditional Break-Even (Knock-In Product)
                </div>
              </div>

              <div className="space-y-3">
                {/* Scenario 1: Above KI */}
                <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">✅</div>
                    <div className="flex-1">
                      <div className="font-bold text-valura-ink mb-2">
                        Scenario 1: Final Level ≥ {formatNumber(be.knockInLevelPct, 0)}% (Barrier NOT Breached)
                      </div>
                      {be.protectedBreakevenPct !== null ? (
                        <div className="text-sm text-muted space-y-1">
                          <div>
                            • <span className="font-semibold">Break-even at:</span> <span className="text-warning-fg font-bold">{formatNumber(be.protectedBreakevenPct, 1)}%</span>
                          </div>
                          <div>
                            • <span className="font-semibold">Protected floor:</span> {formatNumber(be.capitalProtectionPct, 0)}%
                          </div>
                          <div>
                            • <span className="font-semibold">Participation:</span> {formatNumber(terms.participationRatePct, 0)}% above {formatNumber(terms.participationStartPct, 0)}%
                          </div>
                        </div>
                      ) : be.capitalProtectionPct >= 100 ? (
                        <div className="text-sm text-success-fg font-semibold">
                          Always profitable - capital protected at {formatNumber(be.capitalProtectionPct, 0)}%
                        </div>
                      ) : (
                        <div className="text-sm text-warning-fg font-semibold">
                          Break-even unreachable in protected regime (likely due to cap)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scenario 2: Below KI */}
                <div className="p-4 bg-white rounded-lg border-2 border-orange-300">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">⚠️</div>
                    <div className="flex-1">
                      <div className="font-bold text-valura-ink mb-2">
                        Scenario 2: Final Level &lt; {formatNumber(be.knockInLevelPct, 0)}% (Knock-In Triggered)
                      </div>
                      <div className="text-sm text-muted space-y-1">
                        <div>
                          • <span className="font-semibold">Capital protection removed</span> - switches to geared-put payoff
                        </div>
                        <div>
                          • <span className="font-semibold">Formula:</span> <span className="font-mono text-xs">Payoff = 100 × (X / {formatNumber(terms.downsideStrikePct ?? be.knockInLevelPct, 0)})</span>
                        </div>
                        <div>
                          • <span className="font-semibold">Break-even:</span> At downside strike ({formatNumber(terms.downsideStrikePct ?? be.knockInLevelPct, 0)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted">
                  <div className="font-semibold text-text-primary mb-1">Knock-In ("Airbag") Explanation</div>
                  <div>
                    Capital protection is <span className="font-semibold">conditional</span>. 
                    It holds as long as the final level stays above {formatNumber(be.knockInLevelPct, 0)}% at maturity. 
                    If breached, protection is removed and payoff uses geared-put formula instead.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================== */}
        {/* IMPOSSIBLE: Cannot Reach Break-Even */}
        {/* ========================================== */}
        {be.kind === 'impossible' && (
          <>
            <div className="p-5 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-xl border-2 border-orange-400 shadow-md">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <AlertCircle className="w-7 h-7 text-warning-fg" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-orange-700 font-semibold mb-1 uppercase tracking-wide">Break-Even Status</div>
                  <div className="text-2xl font-extrabold text-warning-fg mb-2">
                    Break-Even Unreachable
                  </div>
                  <div className="text-sm text-muted mb-3">
                    {be.reason}
                  </div>
                  {be.maxReturnPct != null && (
                    <div className="text-sm">
                      <span className="font-semibold text-valura-ink">Maximum possible return:</span>{' '}
                      <span className="text-xl font-bold text-warning-fg">{formatNumber(be.maxReturnPct, 1)}%</span>
                      {be.maxReturnPct < 100 && (
                        <span className="text-danger-fg font-semibold ml-2">
                          (Maximum loss: {formatNumber(100 - be.maxReturnPct, 1)}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted">
                  <div className="font-semibold text-text-primary mb-1">Why Break-Even is Unreachable</div>
                  <div>
                    The product structure prevents the payoff from reaching 100% (break-even point). 
                    This typically occurs when:
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Capital protection is low and participation rate is insufficient</li>
                      <li>A cap is set below 100%</li>
                      <li>Participation rate is zero or negative</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </CardShell>
  );
}















