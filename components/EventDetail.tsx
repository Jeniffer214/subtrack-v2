"use client";

import { useState } from "react";
import type { EventStats } from "@/lib/analytics";
import { ASSETS } from "@/lib/data/catalog";
import { formatInZone, zoneLabel } from "@/lib/time";
import type { AssetCode, CalendarEvent } from "@/lib/types";
import { Scatter } from "./Scatter";
import { Score } from "./Score";
import { useViewerPrefs } from "./useViewerPrefs";

const r = (x: number, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : "—");
const signed = (x: number, d = 1) => `${x > 0 ? "+" : ""}${r(x, d)}`;

export function EventDetail({ event, stats }: { event: CalendarEvent; stats: EventStats }) {
  const { timeZone } = useViewerPrefs();
  const [asset, setAsset] = useState<AssetCode>(() => [...stats.assets].sort((a, b) => b.score - a.score)[0].asset);
  const [showAll, setShowAll] = useState(false);

  const sel = stats.assets.find((a) => a.asset === asset)!;
  const selMeta = ASSETS.find((a) => a.code === asset)!;
  const z = event.actual !== null && stats.surpriseStd ? (event.actual - event.forecast) / stats.surpriseStd : null;
  const u = (v: number | null) => (v === null ? "—" : `${v.toFixed(event.decimals)}${event.unit}`);
  const releases = showAll ? [...stats.releases].reverse() : [...stats.releases].reverse().slice(0, 8);

  return (
    <>
      <div className="card">
        <div className="controls">
          <div>
            <span className="muted">发布时间 </span>
            {timeZone ? `${formatInZone(event.releaseUtc, timeZone)}（${zoneLabel(timeZone, new Date(event.releaseUtc))}）` : event.releaseUtc}
          </div>
          <div>
            <span className="muted">实际 </span>
            {u(event.actual)}
          </div>
          <div>
            <span className="muted">预期 </span>
            {u(event.forecast)}
          </div>
          <div>
            <span className="muted">前值 </span>
            {u(event.previous)}
          </div>
          <div>
            <span className="muted">意外度 </span>
            {z === null ? "待发布" : `${signed(z, 2)}σ`}
          </div>
          <div>
            <span className="muted">历史意外标准差 </span>
            {r(stats.surpriseStd, 3)}
            {event.unit}（n={stats.n}）
          </div>
        </div>
      </div>

      <div className="card table-wrap">
        <h2>各资产透明影响分</h2>
        <table>
          <thead>
            <tr>
              <th>资产</th>
              <th>影响分</th>
              <th className="num">发布后1h波动中位数</th>
              <th className="num">平时1h波动</th>
              <th className="num">倍数</th>
              <th className="num">每+1σ意外的1h反应</th>
              <th className="num">R²</th>
              <th className="num">方向命中率</th>
              <th className="num">n</th>
            </tr>
          </thead>
          <tbody>
            {[...stats.assets]
              .sort((a, b) => b.score - a.score)
              .map((a) => {
                const meta = ASSETS.find((x) => x.code === a.asset)!;
                return (
                  <tr key={a.asset} onClick={() => setAsset(a.asset)} style={{ cursor: "pointer", fontWeight: a.asset === asset ? 600 : 400 }}>
                    <td>{meta.nameZh}</td>
                    <td>
                      <Score value={a.score} />
                    </td>
                    <td className="num">{r(a.medianAbs1h)}</td>
                    <td className="num">{a.baseline1h}</td>
                    <td className="num">{r(a.ratio, 2)}×</td>
                    <td className="num">
                      {signed(a.sensitivity)} {meta.unitLabel}
                    </td>
                    <td className="num">{r(a.r2, 2)}</td>
                    <td className="num">{a.hitRate === null ? "—" : `${Math.round(a.hitRate * 100)}%（${a.hitRateN}次）`}</td>
                    <td className="num">{a.n}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <div className="formula" style={{ marginTop: 8 }}>
          影响分 = clamp(round(2 × 倍数), 1, 10)；倍数 = 发布后1h |波动| 中位数 ÷ 平时1h |波动|
          <br />
          每+1σ反应 = 以意外度 z 为自变量、1h 反应为因变量的最小二乘斜率；命中率只统计 |z| ≥ 0.5 的发布
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <h2>意外度 vs {selMeta.nameZh} 1小时反应</h2>
          <Scatter points={sel.points} slope={sel.sensitivity} unit={selMeta.unitLabel} />
          <p className="muted">
            点击上表切换资产。R²={r(sel.r2, 2)}
            {sel.r2 < 0.2 || sel.n < 12 ? "，关系统计上不可靠" : ""}。
          </p>
        </div>
        <div className="card table-wrap">
          <h2>历史发布（{selMeta.nameZh}，bp）</h2>
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th className="num">实际</th>
                <th className="num">预期</th>
                <th className="num">z</th>
                <th className="num">5m</th>
                <th className="num">15m</th>
                <th className="num">1h</th>
                <th className="num">4h</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((rel) => {
                const rx = rel.reactions[asset];
                return (
                  <tr key={rel.releaseUtc}>
                    <td>{rel.releaseUtc.slice(0, 10)}</td>
                    <td className="num">{rel.actual.toFixed(event.decimals)}</td>
                    <td className="num">{rel.forecast.toFixed(event.decimals)}</td>
                    <td className="num">{signed(rel.z, 1)}</td>
                    {(["m5", "m15", "h1", "h4"] as const).map((h) => (
                      <td key={h} className={`num ${rx[h] > 0 ? "up" : rx[h] < 0 ? "down" : ""}`}>
                        {signed(rx[h])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!showAll && stats.releases.length > 8 && (
            <button className="btn" style={{ marginTop: 8 }} onClick={() => setShowAll(true)}>
              显示全部 {stats.releases.length} 次
            </button>
          )}
        </div>
      </div>
    </>
  );
}
