"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { watchlistScore } from "@/lib/analytics";
import { ASSETS, COUNTRIES } from "@/lib/data/catalog";
import { countdown, dayKeyInZone, formatInZone, zoneLabel } from "@/lib/time";
import type { AssetCode, CalendarEvent, Country } from "@/lib/types";
import { Score } from "./Score";
import { TIME_ZONES, useViewerPrefs } from "./useViewerPrefs";

export interface CalendarRow {
  event: CalendarEvent;
  overallScore: number;
  assetScores: Record<string, number>;
  surpriseStd: number;
}

function fmt(v: number | null, e: CalendarEvent) {
  return v === null ? "—" : `${v.toFixed(e.decimals)}${e.unit}`;
}

export function CalendarView({ rows }: { rows: CalendarRow[] }) {
  const { timeZone, setTimeZone, watchlist, setWatchlist } = useViewerPrefs();
  const [minScore, setMinScore] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const visible = useMemo(
    () =>
      rows
        .map((r) => ({
          ...r,
          score: watchlistScore(
            { overallScore: r.overallScore, assets: Object.entries(r.assetScores).map(([asset, score]) => ({ asset: asset as AssetCode, score })) },
            watchlist,
          ),
        }))
        .filter((r) => r.score >= minScore && (countries.length === 0 || countries.includes(r.event.country))),
    [rows, watchlist, minScore, countries],
  );

  if (!timeZone) return <div className="card muted">加载中…</div>;

  const byDay = new Map<string, typeof visible>();
  for (const r of visible) {
    const k = dayKeyInZone(r.event.releaseUtc, timeZone);
    byDay.set(k, [...(byDay.get(k) ?? []), r]);
  }

  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  return (
    <>
      <div className="card controls">
        <div>
          <label>时区</label>
          <select value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
            {[...new Set([timeZone, ...TIME_ZONES])].map((tz) => (
              <option key={tz} value={tz}>
                {tz}（{zoneLabel(tz)}）
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>最低影响分</label>
          <select value={minScore} onChange={(e) => setMinScore(Number(e.target.value))}>
            {[1, 3, 5, 7].map((s) => (
              <option key={s} value={s}>
                ≥ {s}
              </option>
            ))}
          </select>
        </div>
        <div className="chips" aria-label="国家筛选">
          {(Object.keys(COUNTRIES) as Country[]).map((c) => (
            <button key={c} className="chip" aria-pressed={countries.includes(c)} onClick={() => setCountries(toggle(countries, c))}>
              {COUNTRIES[c]}
            </button>
          ))}
        </div>
        <div style={{ width: "100%" }}>
          <label>我关注的资产（影响分只按这些资产计算）</label>
          <div className="chips" style={{ marginTop: 4 }}>
            {ASSETS.map((a) => (
              <button key={a.code} className="chip" aria-pressed={watchlist.includes(a.code)} onClick={() => setWatchlist(toggle(watchlist, a.code))}>
                {a.nameZh}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 && <div className="card muted">没有符合筛选条件的事件。</div>}

      {[...byDay.entries()].map(([day, list]) => (
        <section key={day}>
          <div className="day">{formatInZone(list[0].event.releaseUtc, timeZone).split(" ")[0]}</div>
          <div className="card table-wrap" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>时间 ({zoneLabel(timeZone, new Date(list[0].event.releaseUtc))})</th>
                  <th>国家</th>
                  <th>事件</th>
                  <th>影响分</th>
                  <th className="num">实际</th>
                  <th className="num">预期</th>
                  <th className="num">前值</th>
                  <th className="num">意外度</th>
                  <th>倒计时</th>
                </tr>
              </thead>
              <tbody>
                {list.map(({ event: e, score, surpriseStd }) => {
                  const z = e.actual !== null && surpriseStd ? (e.actual - e.forecast) / surpriseStd : null;
                  return (
                    <tr key={e.id}>
                      <td>{formatInZone(e.releaseUtc, timeZone, false)}</td>
                      <td>{COUNTRIES[e.country]}</td>
                      <td>
                        <Link href={`/event/${e.id}`}>{e.nameZh}</Link>
                      </td>
                      <td>
                        <Score value={score} />
                      </td>
                      <td className="num">{fmt(e.actual, e)}</td>
                      <td className="num">{fmt(e.forecast, e)}</td>
                      <td className="num">{fmt(e.previous, e)}</td>
                      <td className={`num ${z === null ? "" : z > 0 ? "up" : z < 0 ? "down" : ""}`}>
                        {z === null ? "—" : `${z > 0 ? "+" : ""}${z.toFixed(1)}σ`}
                      </td>
                      <td className="muted">{now ? countdown(e.releaseUtc, now) : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
