/** All times are stored in UTC and rendered in the viewer's IANA time zone. */
export function formatInZone(iso: string, timeZone: string, withDate = true): string {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone,
    ...(withDate ? { month: "2-digit", day: "2-digit", weekday: "short" } : {}),
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
  return parts;
}

/** Calendar day key (YYYY-MM-DD) of an instant in the given zone, for grouping. */
export function dayKeyInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

/** Short zone label such as "GMT+8", correct for the given instant (DST-aware). */
export function zoneLabel(timeZone: string, at: Date = new Date()): string {
  const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? timeZone;
}

export function countdown(iso: string, now: Date): string {
  const ms = new Date(iso).getTime() - now.getTime();
  if (ms <= 0) return "已发布";
  const m = Math.floor(ms / 60_000);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const mm = m % 60;
  if (d > 0) return `${d}天${h}小时`;
  if (h > 0) return `${h}小时${mm}分`;
  return `${mm}分钟`;
}
