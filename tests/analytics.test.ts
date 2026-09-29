import { describe, expect, it } from "vitest";
import { computeEventStats, impactScoreFromRatio, surpriseZ, watchlistScore } from "@/lib/analytics";
import { ols } from "@/lib/stats";
import { ASSET_CODES, type HistoricalRelease, type Reactions } from "@/lib/types";

function reactions(h1ByAsset: (code: string) => number): Reactions {
  return Object.fromEntries(
    ASSET_CODES.map((c) => {
      const h1 = h1ByAsset(c);
      return [c, { m5: h1, m15: h1, h1, h4: h1 }];
    }),
  ) as Reactions;
}

describe("impactScoreFromRatio", () => {
  it("maps a normal hour to 2 and caps at 10", () => {
    expect(impactScoreFromRatio(1)).toBe(2);
    expect(impactScoreFromRatio(5)).toBe(10);
    expect(impactScoreFromRatio(40)).toBe(10);
    expect(impactScoreFromRatio(0)).toBe(1);
    expect(impactScoreFromRatio(NaN)).toBe(1);
  });
});

describe("surpriseZ", () => {
  it("scales by surprise std and guards zero std", () => {
    expect(surpriseZ(3.1, 2.9, 0.1)).toBeCloseTo(2);
    expect(surpriseZ(3.1, 2.9, 0)).toBe(0);
  });
});

describe("ols", () => {
  it("recovers an exact line", () => {
    const fit = ols([-2, -1, 0, 1, 2], [-3, -1, 1, 3, 5]);
    expect(fit.slope).toBeCloseTo(2);
    expect(fit.intercept).toBeCloseTo(1);
    expect(fit.r2).toBeCloseTo(1);
  });
});

describe("computeEventStats", () => {
  // Surprises alternate -0.2 .. +0.2; EURUSD reacts -20bp per unit z, others flat.
  const surprises = [-0.2, -0.1, 0, 0.1, 0.2, -0.2, -0.1, 0, 0.1, 0.2, -0.2, 0.2];
  const sd = Math.sqrt(surprises.reduce((a, s) => a + s * s, 0) / (surprises.length - 1));
  const history: HistoricalRelease[] = surprises.map((s, i) => ({
    releaseUtc: new Date(Date.UTC(2025, i, 10)).toISOString(),
    forecast: 3,
    actual: 3 + s,
    previous: 3,
    reactions: reactions((c) => (c === "EURUSD" ? (-20 * s) / sd : 0)),
  }));
  const stats = computeEventStats(history);
  const eur = stats.assets.find((a) => a.asset === "EURUSD")!;
  const gold = stats.assets.find((a) => a.asset === "XAUUSD")!;

  it("measures sensitivity, fit and hit rate", () => {
    expect(stats.n).toBe(12);
    expect(eur.sensitivity).toBeCloseTo(-20, 5);
    expect(eur.r2).toBeCloseTo(1, 5);
    expect(eur.hitRate).toBe(1);
  });

  it("scores a reacting asset above a flat one", () => {
    expect(eur.score).toBeGreaterThan(gold.score);
    expect(gold.score).toBe(1);
    expect(stats.overallScore).toBe(eur.score);
  });

  it("restricts score to the watchlist", () => {
    expect(watchlistScore(stats, ["XAUUSD"])).toBe(1);
    expect(watchlistScore(stats, [])).toBe(stats.overallScore);
  });
});
