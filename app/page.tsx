import Link from "next/link";
import { computeEventStats } from "@/lib/analytics";
import { getProvider } from "@/lib/data/provider";
import { weekIndexOf } from "@/lib/data/demo-provider";
import { CalendarView, type CalendarRow } from "@/components/CalendarView";

const DAY_MS = 86_400_000;

export const dynamic = "force-dynamic";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  const offset = Math.max(-4, Math.min(4, Number.parseInt(week ?? "0", 10) || 0));
  const now = new Date();
  // Weeks start Monday 00:00 UTC.
  const from = new Date(4 * DAY_MS + (weekIndexOf(now) + offset) * 7 * DAY_MS);
  const to = new Date(from.getTime() + 7 * DAY_MS);

  const provider = getProvider();
  const rows: CalendarRow[] = provider.listEvents(from, to).map((event) => {
    const stats = computeEventStats(provider.getHistory(event.code, new Date(event.releaseUtc)));
    return {
      event,
      overallScore: stats.overallScore,
      assetScores: Object.fromEntries(stats.assets.map((a) => [a.asset, a.score])),
      surpriseStd: stats.surpriseStd,
    };
  });

  return (
    <main className="container">
      <header className="top">
        <h1>Printlens 澄数</h1>
        <span className="tag">透明可验证的 AI 经济日历</span>
      </header>
      {provider.isDemo && (
        <div className="banner">当前为<b>演示数据</b>（程序合成，非真实行情与真实发布日程），仅用于展示产品功能，不得用于交易决策。</div>
      )}
      <div className="nav" style={{ marginBottom: 12 }}>
        <Link href={`/?week=${offset - 1}`}>← 上一周</Link>
        <Link href="/">本周</Link>
        <Link href={`/?week=${offset + 1}`}>下一周 →</Link>
        <span className="muted">
          {from.toISOString().slice(0, 10)} 至 {new Date(to.getTime() - 1).toISOString().slice(0, 10)}（UTC 周）
        </span>
      </div>
      <CalendarView rows={rows} />
      <p className="muted">
        影响分 = clamp(round(2 × 发布后1小时波动中位数 ÷ 该资产平时1小时波动), 1, 10)。点击事件查看每个资产的样本量与计算过程。
      </p>
    </main>
  );
}
