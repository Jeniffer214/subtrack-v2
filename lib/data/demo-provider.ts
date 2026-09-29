import { gaussian, seededRandom } from "../stats";
import { ASSET_CODES, type AssetCode, type CalendarEvent, type EventDefinition, type HistoricalRelease, type Reactions } from "../types";
import { EVENT_DEFINITIONS, getDefinition } from "./catalog";
import type { CalendarProvider } from "./provider";

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
/** 1970-01-05 was the first Monday after the Unix epoch. */
const FIRST_MONDAY_MS = 4 * DAY_MS;
const HISTORY_LENGTH = 24;
/** Scales catalog betas/noise so headline releases move markets several times a normal hour. */
const DEMO_BETA_SCALE = 1.8;
const DEMO_NOISE_SCALE = 1.3;

export function weekIndexOf(date: Date): number {
  return Math.floor((date.getTime() - FIRST_MONDAY_MS) / WEEK_MS);
}

function weekStart(week: number): number {
  return FIRST_MONDAY_MS + week * WEEK_MS;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Demo schedule: weekly events every week, monthly every 4th week, meetings every 6th. */
export function occursInWeek(def: EventDefinition, week: number): boolean {
  const offset = hashCode(def.code);
  if (def.frequency === "weekly") return true;
  if (def.frequency === "monthly") return (week + offset) % 4 === 0;
  return (week + offset) % 6 === 0;
}

function releaseTime(def: EventDefinition, week: number): Date {
  return new Date(weekStart(week) + def.weekday * DAY_MS + (def.hourUtc * 60 + def.minuteUtc) * 60_000);
}

function round(x: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(x * f) / f;
}

function eventId(def: EventDefinition, releaseUtc: Date): string {
  return `${def.code}-${releaseUtc.toISOString().slice(0, 10).replaceAll("-", "")}`;
}

interface CoreRelease {
  forecast: number;
  actual: number;
  surprise: number;
}

function coreRelease(def: EventDefinition, week: number): CoreRelease {
  const rand = seededRandom(`${def.code}:${week}`);
  const drift = Math.sin(week / 9 + hashCode(def.code)) * def.surpriseStd * 3;
  // Policy rates move in fixed steps (surpriseStd doubles as the step size).
  const forecast =
    def.inLineProbability !== undefined
      ? round(Math.round((def.typicalValue + drift) / def.surpriseStd) * def.surpriseStd, def.decimals)
      : round(def.typicalValue + drift, def.decimals);
  let surprise: number;
  if (def.inLineProbability !== undefined) {
    // Policy decisions: usually in line, otherwise a 25bp surprise.
    surprise = rand() < def.inLineProbability ? 0 : (rand() < 0.5 ? -1 : 1) * def.surpriseStd;
  } else {
    surprise = gaussian(rand) * def.surpriseStd;
  }
  const actual = round(forecast + surprise, def.decimals);
  return { forecast, actual, surprise: actual - forecast };
}

function previousOccurrence(def: EventDefinition, week: number): number {
  let w = week - 1;
  while (!occursInWeek(def, w)) w--;
  return w;
}

function reactions(def: EventDefinition, week: number, surprise: number): Reactions {
  const rand = seededRandom(`${def.code}:${week}:reactions`);
  const z = surprise / def.surpriseStd;
  const out = {} as Reactions;
  for (const code of ASSET_CODES) {
    const beta = (def.betas[code as AssetCode] ?? 0) * DEMO_BETA_SCALE;
    const noise = (def.noise[code as AssetCode] ?? 5) * DEMO_NOISE_SCALE;
    const h1 = beta * z + noise * gaussian(rand);
    out[code] = {
      m5: round(0.6 * h1 + 0.2 * noise * gaussian(rand), 1),
      m15: round(0.85 * h1 + 0.25 * noise * gaussian(rand), 1),
      h1: round(h1, 1),
      h4: round(1.1 * h1 + 0.8 * noise * gaussian(rand), 1),
    };
  }
  return out;
}

export class DemoProvider implements CalendarProvider {
  readonly name = "演示数据（合成，非真实行情）";
  readonly isDemo = true;

  constructor(private readonly now: Date) {}

  private buildEvent(def: EventDefinition, week: number): CalendarEvent {
    const releaseUtc = releaseTime(def, week);
    const core = coreRelease(def, week);
    const prev = coreRelease(def, previousOccurrence(def, week));
    const released = releaseUtc.getTime() <= this.now.getTime();
    return {
      id: eventId(def, releaseUtc),
      code: def.code,
      country: def.country,
      nameZh: def.nameZh,
      nameEn: def.nameEn,
      category: def.category,
      unit: def.unit,
      decimals: def.decimals,
      releaseUtc: releaseUtc.toISOString(),
      forecast: core.forecast,
      previous: prev.actual,
      actual: released ? core.actual : null,
      source: this.name,
      updatedUtc: this.now.toISOString(),
    };
  }

  listEvents(fromUtc: Date, toUtc: Date): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    for (let w = weekIndexOf(fromUtc) - 1; w <= weekIndexOf(toUtc); w++) {
      for (const def of EVENT_DEFINITIONS) {
        if (!occursInWeek(def, w)) continue;
        const t = releaseTime(def, w).getTime();
        if (t >= fromUtc.getTime() && t < toUtc.getTime()) events.push(this.buildEvent(def, w));
      }
    }
    return events.sort((a, b) => a.releaseUtc.localeCompare(b.releaseUtc));
  }

  getEvent(id: string): CalendarEvent | undefined {
    const m = /^([A-Z0-9_]+)-(\d{4})(\d{2})(\d{2})$/.exec(id);
    if (!m) return undefined;
    const def = getDefinition(m[1]);
    if (!def) return undefined;
    const week = weekIndexOf(new Date(Date.UTC(+m[2], +m[3] - 1, +m[4])));
    if (!occursInWeek(def, week)) return undefined;
    const event = this.buildEvent(def, week);
    return event.id === id ? event : undefined;
  }

  getHistory(code: string, beforeUtc: Date): HistoricalRelease[] {
    const def = getDefinition(code);
    if (!def) return [];
    const history: HistoricalRelease[] = [];
    let w = weekIndexOf(beforeUtc);
    if (!occursInWeek(def, w) || releaseTime(def, w).getTime() >= beforeUtc.getTime()) w = previousOccurrence(def, w);
    while (history.length < HISTORY_LENGTH) {
      const core = coreRelease(def, w);
      history.push({
        releaseUtc: releaseTime(def, w).toISOString(),
        actual: core.actual,
        forecast: core.forecast,
        previous: coreRelease(def, previousOccurrence(def, w)).actual,
        reactions: reactions(def, w, core.surprise),
      });
      w = previousOccurrence(def, w);
    }
    return history.reverse();
  }
}
