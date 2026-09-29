import type { CalendarEvent, HistoricalRelease } from "../types";
import { DemoProvider } from "./demo-provider";

/**
 * Data source abstraction. The MVP ships only DemoProvider (synthetic data);
 * a production provider (e.g. Trading Economics / FMP plus intraday prices)
 * implements the same interface.
 */
export interface CalendarProvider {
  readonly name: string;
  readonly isDemo: boolean;
  /** Events whose release time falls in [fromUtc, toUtc). */
  listEvents(fromUtc: Date, toUtc: Date): CalendarEvent[];
  getEvent(id: string): CalendarEvent | undefined;
  /** Past releases of the same indicator, oldest first, strictly before `beforeUtc`. */
  getHistory(code: string, beforeUtc: Date): HistoricalRelease[];
}

/** A fresh provider per request so "released" is judged against the current time. */
export function getProvider(): CalendarProvider {
  return new DemoProvider(new Date());
}
