import type { Asset, Country, EventDefinition } from "../types";

export const ASSETS: Asset[] = [
  { code: "EURUSD", nameZh: "欧元/美元", unitLabel: "bp", baseline1h: 8 },
  { code: "USDJPY", nameZh: "美元/日元", unitLabel: "bp", baseline1h: 10 },
  { code: "USDCNH", nameZh: "美元/离岸人民币", unitLabel: "bp", baseline1h: 5 },
  { code: "XAUUSD", nameZh: "黄金", unitLabel: "bp", baseline1h: 15 },
  { code: "US500", nameZh: "标普500", unitLabel: "bp", baseline1h: 12 },
  { code: "NAS100", nameZh: "纳斯达克100", unitLabel: "bp", baseline1h: 18 },
  { code: "US10Y", nameZh: "美债10年收益率", unitLabel: "bp(收益率)", baseline1h: 1.5 },
];

export const COUNTRIES: Record<Country, string> = {
  US: "美国",
  EZ: "欧元区",
  UK: "英国",
  JP: "日本",
  CN: "中国",
  AU: "澳大利亚",
};

/**
 * Event catalog. `betas` / `noise` only drive the synthetic demo history; a
 * real data provider replaces them with measured market reactions.
 * Sign convention: positive surprise = stronger/hotter than consensus.
 */
export const EVENT_DEFINITIONS: EventDefinition[] = [
  {
    code: "US_CPI_YOY", country: "US", nameZh: "美国CPI年率", nameEn: "US CPI y/y", category: "通胀",
    unit: "%", frequency: "monthly", weekday: 2, hourUtc: 12, minuteUtc: 30, typicalValue: 2.9, surpriseStd: 0.1, decimals: 1,
    betas: { EURUSD: -22, USDJPY: 28, USDCNH: 9, XAUUSD: -35, US500: -30, NAS100: -45, US10Y: 5 },
    noise: { EURUSD: 10, USDJPY: 12, USDCNH: 5, XAUUSD: 18, US500: 15, NAS100: 22, US10Y: 2 },
  },
  {
    code: "US_NFP", country: "US", nameZh: "美国非农就业人数", nameEn: "US Nonfarm Payrolls", category: "就业",
    unit: "K", frequency: "monthly", weekday: 4, hourUtc: 12, minuteUtc: 30, typicalValue: 150, surpriseStd: 60, decimals: 0,
    betas: { EURUSD: -25, USDJPY: 30, USDCNH: 10, XAUUSD: -30, US500: 10, NAS100: 8, US10Y: 6 },
    noise: { EURUSD: 14, USDJPY: 16, USDCNH: 6, XAUUSD: 22, US500: 20, NAS100: 28, US10Y: 2.5 },
  },
  {
    code: "US_FOMC", country: "US", nameZh: "美联储利率决议", nameEn: "FOMC Rate Decision", category: "央行",
    unit: "%", frequency: "meeting", weekday: 2, hourUtc: 18, minuteUtc: 0, typicalValue: 3.75, surpriseStd: 0.25, decimals: 2,
    inLineProbability: 0.85,
    betas: { EURUSD: -30, USDJPY: 35, USDCNH: 12, XAUUSD: -45, US500: -40, NAS100: -55, US10Y: 8 },
    noise: { EURUSD: 25, USDJPY: 28, USDCNH: 9, XAUUSD: 35, US500: 35, NAS100: 50, US10Y: 4 },
  },
  {
    code: "US_RETAIL", country: "US", nameZh: "美国零售销售月率", nameEn: "US Retail Sales m/m", category: "消费",
    unit: "%", frequency: "monthly", weekday: 1, hourUtc: 12, minuteUtc: 30, typicalValue: 0.3, surpriseStd: 0.4, decimals: 1,
    betas: { EURUSD: -12, USDJPY: 14, USDCNH: 4, XAUUSD: -12, US500: 6, NAS100: 5, US10Y: 3 },
    noise: { EURUSD: 9, USDJPY: 11, USDCNH: 5, XAUUSD: 15, US500: 13, NAS100: 19, US10Y: 1.6 },
  },
  {
    code: "US_ISM_MFG", country: "US", nameZh: "美国ISM制造业PMI", nameEn: "US ISM Manufacturing PMI", category: "PMI",
    unit: "", frequency: "monthly", weekday: 0, hourUtc: 14, minuteUtc: 0, typicalValue: 49.0, surpriseStd: 1.2, decimals: 1,
    betas: { EURUSD: -9, USDJPY: 11, USDCNH: 3, XAUUSD: -8, US500: 8, NAS100: 9, US10Y: 2 },
    noise: { EURUSD: 8, USDJPY: 10, USDCNH: 5, XAUUSD: 14, US500: 12, NAS100: 18, US10Y: 1.5 },
  },
  {
    code: "US_CLAIMS", country: "US", nameZh: "美国初请失业金人数", nameEn: "US Initial Jobless Claims", category: "就业",
    unit: "K", frequency: "weekly", weekday: 3, hourUtc: 12, minuteUtc: 30, typicalValue: 225, surpriseStd: 12, decimals: 0,
    betas: { EURUSD: 4, USDJPY: -5, USDCNH: -1, XAUUSD: 5, US500: -2, NAS100: -2, US10Y: -1 },
    noise: { EURUSD: 8, USDJPY: 10, USDCNH: 5, XAUUSD: 15, US500: 12, NAS100: 18, US10Y: 1.5 },
  },
  {
    code: "EZ_CPI_FLASH", country: "EZ", nameZh: "欧元区CPI年率初值", nameEn: "Eurozone CPI Flash y/y", category: "通胀",
    unit: "%", frequency: "monthly", weekday: 1, hourUtc: 9, minuteUtc: 0, typicalValue: 2.1, surpriseStd: 0.1, decimals: 1,
    betas: { EURUSD: 14, USDJPY: 0, USDCNH: -1, XAUUSD: 2, US500: -2, NAS100: -2, US10Y: 0.5 },
    noise: { EURUSD: 9, USDJPY: 9, USDCNH: 4, XAUUSD: 14, US500: 11, NAS100: 16, US10Y: 1.4 },
  },
  {
    code: "EZ_ECB", country: "EZ", nameZh: "欧洲央行利率决议", nameEn: "ECB Rate Decision", category: "央行",
    unit: "%", frequency: "meeting", weekday: 3, hourUtc: 12, minuteUtc: 15, typicalValue: 2.0, surpriseStd: 0.25, decimals: 2,
    inLineProbability: 0.9,
    betas: { EURUSD: 28, USDJPY: 2, USDCNH: -2, XAUUSD: 3, US500: -3, NAS100: -4, US10Y: 1 },
    noise: { EURUSD: 20, USDJPY: 12, USDCNH: 5, XAUUSD: 18, US500: 14, NAS100: 20, US10Y: 1.8 },
  },
  {
    code: "UK_CPI", country: "UK", nameZh: "英国CPI年率", nameEn: "UK CPI y/y", category: "通胀",
    unit: "%", frequency: "monthly", weekday: 2, hourUtc: 6, minuteUtc: 0, typicalValue: 3.6, surpriseStd: 0.15, decimals: 1,
    betas: { EURUSD: -2, USDJPY: 1, USDCNH: 0, XAUUSD: 1, US500: 0, NAS100: 0, US10Y: 0.3 },
    noise: { EURUSD: 7, USDJPY: 8, USDCNH: 4, XAUUSD: 12, US500: 9, NAS100: 13, US10Y: 1.1 },
  },
  {
    code: "JP_BOJ", country: "JP", nameZh: "日本央行利率决议", nameEn: "BoJ Rate Decision", category: "央行",
    unit: "%", frequency: "meeting", weekday: 4, hourUtc: 3, minuteUtc: 0, typicalValue: 0.5, surpriseStd: 0.25, decimals: 2,
    inLineProbability: 0.85,
    betas: { EURUSD: 2, USDJPY: -45, USDCNH: -3, XAUUSD: 6, US500: -4, NAS100: -6, US10Y: 1 },
    noise: { EURUSD: 8, USDJPY: 30, USDCNH: 5, XAUUSD: 15, US500: 12, NAS100: 18, US10Y: 1.5 },
  },
  {
    code: "CN_CPI", country: "CN", nameZh: "中国CPI年率", nameEn: "China CPI y/y", category: "通胀",
    unit: "%", frequency: "monthly", weekday: 1, hourUtc: 1, minuteUtc: 30, typicalValue: 0.2, surpriseStd: 0.2, decimals: 1,
    betas: { EURUSD: 1, USDJPY: 0, USDCNH: -6, XAUUSD: 3, US500: 1, NAS100: 1, US10Y: 0.2 },
    noise: { EURUSD: 6, USDJPY: 7, USDCNH: 5, XAUUSD: 11, US500: 8, NAS100: 12, US10Y: 1 },
  },
  {
    code: "CN_PMI", country: "CN", nameZh: "中国官方制造业PMI", nameEn: "China NBS Manufacturing PMI", category: "PMI",
    unit: "", frequency: "monthly", weekday: 1, hourUtc: 1, minuteUtc: 30, typicalValue: 49.6, surpriseStd: 0.4, decimals: 1,
    betas: { EURUSD: 2, USDJPY: 1, USDCNH: -9, XAUUSD: 5, US500: 2, NAS100: 2, US10Y: 0.3 },
    noise: { EURUSD: 6, USDJPY: 7, USDCNH: 6, XAUUSD: 11, US500: 8, NAS100: 12, US10Y: 1 },
  },
  {
    code: "CN_LPR", country: "CN", nameZh: "中国一年期LPR", nameEn: "China 1Y Loan Prime Rate", category: "央行",
    unit: "%", frequency: "monthly", weekday: 0, hourUtc: 1, minuteUtc: 15, typicalValue: 3.0, surpriseStd: 0.1, decimals: 2,
    inLineProbability: 0.9,
    betas: { EURUSD: 0, USDJPY: 0, USDCNH: 12, XAUUSD: 1, US500: 0, NAS100: 0, US10Y: 0 },
    noise: { EURUSD: 6, USDJPY: 7, USDCNH: 6, XAUUSD: 11, US500: 8, NAS100: 12, US10Y: 1 },
  },
  {
    code: "AU_EMPLOY", country: "AU", nameZh: "澳大利亚就业人数变动", nameEn: "Australia Employment Change", category: "就业",
    unit: "K", frequency: "monthly", weekday: 3, hourUtc: 1, minuteUtc: 30, typicalValue: 25, surpriseStd: 20, decimals: 1,
    betas: { EURUSD: 0, USDJPY: 1, USDCNH: -1, XAUUSD: 2, US500: 0, NAS100: 0, US10Y: 0 },
    noise: { EURUSD: 6, USDJPY: 7, USDCNH: 4, XAUUSD: 11, US500: 8, NAS100: 12, US10Y: 1 },
  },
];

export function getDefinition(code: string): EventDefinition | undefined {
  return EVENT_DEFINITIONS.find((d) => d.code === code);
}
