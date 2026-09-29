import { describe, expect, it } from "vitest";
import { DemoProvider } from "@/lib/data/demo-provider";

const now = new Date("2026-09-29T08:00:00Z");
const provider = new DemoProvider(now);
const from = new Date("2026-09-28T00:00:00Z");
const to = new Date("2026-10-05T00:00:00Z");

describe("DemoProvider", () => {
  const events = provider.listEvents(from, to);

  it("lists sorted events inside the range", () => {
    expect(events.length).toBeGreaterThan(0);
    for (const e of events) {
      expect(e.releaseUtc >= from.toISOString() && e.releaseUtc < to.toISOString()).toBe(true);
    }
    expect([...events].sort((a, b) => a.releaseUtc.localeCompare(b.releaseUtc))).toEqual(events);
  });

  it("only reveals actuals for released events", () => {
    for (const e of events) expect(e.actual === null).toBe(e.releaseUtc > now.toISOString());
  });

  it("round-trips ids and is deterministic", () => {
    for (const e of events) expect(provider.getEvent(e.id)).toEqual(e);
    expect(new DemoProvider(now).listEvents(from, to)).toEqual(events);
    expect(provider.getEvent("NOPE-20260101")).toBeUndefined();
  });

  it("returns 24 releases strictly before the event", () => {
    const e = events[0];
    const history = provider.getHistory(e.code, new Date(e.releaseUtc));
    expect(history).toHaveLength(24);
    expect(history.every((h) => h.releaseUtc < e.releaseUtc)).toBe(true);
    expect(history.map((h) => h.releaseUtc)).toEqual([...history.map((h) => h.releaseUtc)].sort());
  });
});
