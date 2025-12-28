/**
 * CPPN guardrails to prevent discontinuity / "weird payoff" around KI.
 *
 * Continuity at KI:
 * Choose S such that payoff just below KI equals protected payoff at KI:
 *   100 * c * (KI / S) = protectedPayoffAtKI
 * => S_min = (100 * c * KI) / protectedPayoffAtKI
 */

export type CppnProtectedParams = {
  capitalProtectionPct: number; // P
  participationDirection: 'up' | 'down';
  participationStartPct: number; // K
  participationRatePct: number; // alpha (%)
  capType: 'none' | 'capped';
  capLevelPct?: number; // C
};

export function computeProtectedPayoffPctAtX(params: CppnProtectedParams, X: number): number {
  const P = params.capitalProtectionPct;
  const K = params.participationStartPct;
  const a = params.participationRatePct / 100;
  const capEnabled = params.capType === 'capped' && typeof params.capLevelPct === 'number';
  const C = params.capLevelPct;

  const delta = params.participationDirection === 'up' ? Math.max(0, X - K) : Math.max(0, K - X);
  const cappedDelta = capEnabled && C != null ? Math.min(delta, Math.max(0, C - K)) : delta;
  return Math.max(P, P + a * cappedDelta);
}

export function computeSMin(P: number, KI: number, c: number = 1): number {
  if (!(P > 0) || !(KI > 0) || !(c > 0)) return NaN;
  return (100 * c * KI) / P;
}

export function computeSMinForContinuity(params: CppnProtectedParams, KI: number, c: number = 1): number {
  const protectedAtKI = computeProtectedPayoffPctAtX(params, KI);
  return computeSMin(protectedAtKI, KI, c);
}

export function enforceStrikeForContinuity(args: {
  params: CppnProtectedParams;
  KI: number;
  strikeS?: number;
  c?: number;
}): { sMin: number; sEnforced: number } {
  const c = args.c ?? 1;
  const sMin = computeSMinForContinuity(args.params, args.KI, c);
  const sRaw = args.strikeS ?? args.KI;
  const sEnforced = Number.isFinite(sMin) ? Math.max(sRaw, sMin) : sRaw;
  return { sMin, sEnforced };
}









