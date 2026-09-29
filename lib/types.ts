export const ASSET_CODES = ["EURUSD", "USDJPY", "USDCNH", "XAUUSD", "US500", "NAS100", "US10Y"] as const;
export type AssetCode = (typeof ASSET_CODES)[number];

export const HORIZONS = ["m5", "m15", "h1", "h4"] as const;
export type Horizon = (typeof HORIZONS)[number];

export type Country = "US" | "EZ" | "UK" | "JP" | "CN" | "AU";

export interface Asset {
  code: AssetCode;
  nameZh: string;
  /** Reactions are in basis points of price change; for yields, in bp of yield. */
  unitLabel: string;
  /** Typical absolute 1h move in a non-event hour, same unit as reactions. */
  baseline1h: number;
}

export interface EventDefinition {
  code: string;
  country: Country;
  nameZh: string;
  nameEn: string;
  category: "通胀" | "就业" | "央行" | "增长" | "PMI" | "消费";
  unit: string;
  frequency: "monthly" | "weekly" | "meeting";
  /** Release weekday offset from Monday (0-6) used for the demo schedule. */
  weekday: number;
  hourUtc: number;
  minuteUtc: number;
  typicalValue: number;
  surpriseStd: number;
  decimals: number;
  /** Probability the release matches consensus exactly (rate decisions). */
  inLineProbability?: number;
  /** Demo-only: bp move per +1σ surprise at the 1h horizon. */
  betas: Partial<Record<AssetCode, number>>;
  /** Demo-only: 1h noise (bp) independent of the surprise, e.g. statement tone. */
  noise: Partial<Record<AssetCode, number>>;
}

export type Reactions = Record<AssetCode, Record<Horizon, number>>;

export interface HistoricalRelease {
  releaseUtc: string;
  actual: number;
  forecast: number;
  previous: number;
  reactions: Reactions;
}

export interface CalendarEvent {
  id: string;
  code: string;
  country: Country;
  nameZh: string;
  nameEn: string;
  category: EventDefinition["category"];
  unit: string;
  decimals: number;
  releaseUtc: string;
  forecast: number;
  previous: number;
  actual: number | null;
  source: string;
  updatedUtc: string;
}
