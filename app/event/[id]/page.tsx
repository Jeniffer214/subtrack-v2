import Link from "next/link";
import { notFound } from "next/navigation";
import { computeEventStats } from "@/lib/analytics";
import { COUNTRIES } from "@/lib/data/catalog";
import { getProvider } from "@/lib/data/provider";
import { BriefPanel } from "@/components/BriefPanel";
import { EventDetail } from "@/components/EventDetail";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = getProvider();
  const event = provider.getEvent(id);
  if (!event) notFound();
  const stats = computeEventStats(provider.getHistory(event.code, new Date(event.releaseUtc)));

  return (
    <main className="container">
      <p>
        <Link href="/">← 返回日历</Link>
      </p>
      <header className="top">
        <h1>{event.nameZh}</h1>
        <span className="tag">
          {COUNTRIES[event.country]} · {event.category} · {event.nameEn}
        </span>
      </header>
      {provider.isDemo && <div className="banner">演示数据：以下全部数字为程序合成，仅用于展示计算方法。</div>}
      <EventDetail event={event} stats={stats} />
      <BriefPanel eventId={event.id} />
      <p className="muted">
        数据源：{event.source} · 更新于 {event.updatedUtc.replace("T", " ").slice(0, 16)} UTC · 本页为历史统计描述，不构成投资建议。
      </p>
    </main>
  );
}
