import { ASSETS } from "./data/catalog";
import { mean, median, ols, stdev } from "./stats";
import type { AssetCode, HistoricalRelease } from "./types";

/**
 * Transparent impact score, 1-10.
 *
 *   ratio = median(|1h reaction after release|) / asset's typical |1h move|
 *   score = clamp(round(2 * ratio), 1, 10)
 *
 * A ratio of 1 (release hour moves like any other hour) scores 2; a ratio of
 * 5 or more scores 10. The inputs are shown to the user next to the score.
 */
export function impactScoreFromRatio(ratio: number): number {
  if (!Number.isFinite(ratio)) return 1;
  return Math.min(10, Math.max(1, Math.round(2 * ratio)));
}

/** Surprise in units of the historical surprise standard deviation. */
export function surpriseZ(actual: number, forecast: number, surpriseStd: number): number {
  if (!Number.isFinite(surpriseStd) || surpriseStd === 0) return 0;
  return (actual - forecast) / surpriseStd;
}

export interface AssetImpact {
  asset: AssetCode;
  n: number;
  medianAbs1h: number;
  baseline1h: number;
  ratio: number;
  score: number;
  /** bp move per +1σ surprise at 1h, from OLS over history. */
  sensitivity: number;
  r2: number;
  /** Share of |z| >= 0.5 releases where the 1h move had the sign the slope predicts. */
  hitRate: number | null;
  hitRateN: number;
  points: { z: number; h1: number; releaseUtc: string }[];
}

export interface EventStats {
  n: number;
  surpriseStd: number;
  meanSurprise: number;
  releases: (HistoricalRelease & { z: number })[];
  assets: AssetImpact[];
  overallScore: number;
}

const HIT_RATE_MIN_Z = 0.5;

export function computeEventStats(history: HistoricalRelease[]): EventStats {
  const surprises = history.map((r) => r.actual - r.forecast);
  const sStd = stdev(surprises);
  const releases = history.map((r) => ({ ...r, z: surpriseZ(r.actual, r.forecast, sStd) }));

  const assets = ASSETS.map((a): AssetImpact => {
    const points = releases.map((r) => ({ z: r.z, h1: r.reactions[a.code].h1, releaseUtc: r.releaseUtc }));
    const medianAbs1h = median(points.map((p) => Math.abs(p.h1)));
    const ratio = medianAbs1h / a.baseline1h;
    const fit = ols(
      points.map((p) => p.z),
      points.map((p) => p.h1),
    );
    const decisive = points.filter((p) => Math.abs(p.z) >= HIT_RATE_MIN_Z && fit.slope !== 0);
    const hits = decisive.filter((p) => Math.sign(p.h1) === Math.sign(fit.slope * p.z)).length;
    return {
      asset: a.code,
      n: points.length,
      medianAbs1h,
      baseline1h: a.baseline1h,
      ratio,
      score: impactScoreFromRatio(ratio),
      sensitivity: fit.slope,
      r2: fit.r2,
      hitRate: decisive.length > 0 ? hits / decisive.length : null,
      hitRateN: decisive.length,
      points,
    };
  });

  return {
    n: history.length,
    surpriseStd: sStd,
    meanSurprise: mean(surprises),
    releases,
    assets,
    overallScore: Math.max(...assets.map((a) => a.score)),
  };
}

/** Score restricted to a watchlist; falls back to the overall score when the list is empty. */
export function watchlistScore(
  stats: { overallScore: number; assets: Pick<AssetImpact, "asset" | "score">[] },
  watchlist: AssetCode[],
): number {
  if (watchlist.length === 0) return stats.overallScore;
  const scores = stats.assets.filter((a) => watchlist.includes(a.asset)).map((a) => a.score);
  return scores.length ? Math.max(...scores) : 1;
}
