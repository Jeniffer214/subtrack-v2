import Anthropic from "@anthropic-ai/sdk";
import type { EventStats } from "../analytics";
import { ASSETS } from "../data/catalog";
import type { CalendarEvent } from "../types";

export interface Brief {
  text: string;
  source: "claude" | "template";
  model?: string;
}

const SYSTEM_PROMPT = `你是经济日历产品中的数据解读助手，读者是中文交易员。
你只能依据用户消息中提供的 JSON 统计数据写作：
- 每个结论都必须引用具体数字（如样本量 n、每 1σ 意外的历史平均反应、R²、命中率）。
- 样本量小于 12 或 R² 低于 0.2 的关系，要明确说明"统计上不可靠"。
- 不预测数据结果，不给出买入、卖出、止损等任何交易建议，不使用"必然""稳赚"类措辞。
- 若数据标注为演示数据，第一句话说明这是演示数据。
输出 4-6 条要点，每条一行，以"• "开头，总长度不超过 350 字。`;

function round(x: number, d = 1): number {
  return Math.round(x * 10 ** d) / 10 ** d;
}

/** Compact, model-facing summary of the stats; the prompt never contains raw price series. */
export function briefInput(event: CalendarEvent, stats: EventStats, isDemo: boolean) {
  return {
    isDemo,
    event: {
      name: event.nameZh,
      releaseUtc: event.releaseUtc,
      unit: event.unit,
      forecast: event.forecast,
      previous: event.previous,
      actual: event.actual,
    },
    history: { n: stats.n, surpriseStd: round(stats.surpriseStd, 3) },
    assets: [...stats.assets]
      .sort((a, b) => b.score - a.score)
      .map((a) => ({
        asset: ASSETS.find((x) => x.code === a.asset)?.nameZh ?? a.asset,
        impactScore: a.score,
        medianAbs1hBp: round(a.medianAbs1h),
        normalHourAbs1hBp: a.baseline1h,
        bpPer1SigmaSurprise1h: round(a.sensitivity),
        r2: round(a.r2, 2),
        hitRate: a.hitRate === null ? null : round(a.hitRate, 2),
        hitRateN: a.hitRateN,
      })),
  };
}

export function templateBrief(event: CalendarEvent, stats: EventStats, isDemo: boolean): Brief {
  const top = [...stats.assets].sort((a, b) => b.score - a.score).slice(0, 3);
  const lines: string[] = [];
  if (isDemo) lines.push("• 以下基于演示数据生成，仅用于展示功能，不代表真实市场。");
  lines.push(`• 基于过去 ${stats.n} 次发布：意外值（实际−预期）的历史标准差为 ${round(stats.surpriseStd, 3)}${event.unit}。`);
  for (const a of top) {
    const name = ASSETS.find((x) => x.code === a.asset)?.nameZh ?? a.asset;
    const reliable = a.n >= 12 && a.r2 >= 0.2;
    lines.push(
      `• ${name}：影响分 ${a.score}/10，发布后 1 小时波动中位数 ${round(a.medianAbs1h)}bp（平时约 ${a.baseline1h}bp）；` +
        `每 +1σ 意外平均 ${round(a.sensitivity) >= 0 ? "+" : ""}${round(a.sensitivity)}bp，R²=${round(a.r2, 2)}` +
        (reliable ? "。" : "，统计上不可靠。"),
    );
  }
  if (event.actual !== null) {
    const z = stats.surpriseStd ? (event.actual - event.forecast) / stats.surpriseStd : 0;
    lines.push(`• 本次实际 ${event.actual}${event.unit}，预期 ${event.forecast}${event.unit}，意外度 ${round(z, 2)}σ。`);
  }
  lines.push("• 以上为历史统计描述，不构成投资建议。");
  return { text: lines.join("\n"), source: "template" };
}

function hasCredentials(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

const cache = new Map<string, Brief>();

/**
 * Grounded brief from Claude. Briefs are identical for every viewer of the same
 * event state, so they are cached in-process by event id + actual value.
 */
export async function generateBrief(event: CalendarEvent, stats: EventStats, isDemo: boolean): Promise<Brief> {
  if (!hasCredentials()) return templateBrief(event, stats, isDemo);

  const key = `${event.id}:${event.actual ?? "pending"}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: JSON.stringify(briefInput(event, stats, isDemo)) }],
    });
    if (response.stop_reason === "refusal") return templateBrief(event, stats, isDemo);
    const text = response.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("")
      .trim();
    if (!text) return templateBrief(event, stats, isDemo);
    const brief: Brief = { text, source: "claude", model: response.model };
    cache.set(key, brief);
    return brief;
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`Claude API error ${err.status}: ${err.message}`);
      return templateBrief(event, stats, isDemo);
    }
    throw err;
  }
}
