import { describe, expect, it } from "vitest";
import { countdown, dayKeyInZone, zoneLabel } from "@/lib/time";

describe("time helpers", () => {
  it("groups by the viewer's calendar day", () => {
    // 20:30 UTC is already the next day in Shanghai.
    expect(dayKeyInZone("2026-09-29T20:30:00Z", "Asia/Shanghai")).toBe("2026-09-30");
    expect(dayKeyInZone("2026-09-29T20:30:00Z", "America/New_York")).toBe("2026-09-29");
  });

  it("labels DST-aware offsets", () => {
    expect(zoneLabel("America/New_York", new Date("2026-07-01T12:00:00Z"))).toBe("GMT-4");
    expect(zoneLabel("America/New_York", new Date("2026-12-01T12:00:00Z"))).toBe("GMT-5");
  });

  it("formats countdowns", () => {
    const now = new Date("2026-09-29T00:00:00Z");
    expect(countdown("2026-09-28T00:00:00Z", now)).toBe("已发布");
    expect(countdown("2026-09-29T00:45:00Z", now)).toBe("45分钟");
    expect(countdown("2026-09-30T02:05:00Z", now)).toBe("1天2小时");
  });
});
