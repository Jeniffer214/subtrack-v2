"use client";

import { useState } from "react";

interface BriefResponse {
  text: string;
  source: "claude" | "template";
  model?: string;
}

export function BriefPanel({ eventId }: { eventId: string }) {
  const [brief, setBrief] = useState<BriefResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setBrief((await res.json()) as BriefResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>AI 解读</h2>
      <p className="muted">只基于上方统计数据生成，每条结论引用具体数字；不预测结果、不给交易建议。</p>
      {!brief && (
        <button className="btn primary" onClick={load} disabled={loading}>
          {loading ? "生成中…" : "生成解读"}
        </button>
      )}
      {error && <p className="down">生成失败：{error}</p>}
      {brief && (
        <>
          <div className="brief">{brief.text}</div>
          <p className="muted" style={{ marginTop: 8 }}>
            {brief.source === "claude" ? `由 Claude（${brief.model}）基于统计数据生成` : "规则模板生成（未配置 ANTHROPIC_API_KEY）"}
          </p>
        </>
      )}
    </div>
  );
}
