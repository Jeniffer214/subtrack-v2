"use client";

import { useEffect, useState } from "react";
import { ASSET_CODES, type AssetCode } from "@/lib/types";

const TZ_KEY = "pl.timezone";
const WATCH_KEY = "pl.watchlist";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode etc.); preferences just won't persist.
  }
}

/** Time zone and watchlist are per-viewer conveniences kept in localStorage. */
export function useViewerPrefs() {
  const [timeZone, setTimeZoneState] = useState<string | null>(null);
  const [watchlist, setWatchlistState] = useState<AssetCode[]>([]);

  useEffect(() => {
    setTimeZoneState(read(TZ_KEY) ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
    try {
      const parsed = JSON.parse(read(WATCH_KEY) ?? "[]");
      if (Array.isArray(parsed)) setWatchlistState(parsed.filter((c): c is AssetCode => ASSET_CODES.includes(c)));
    } catch {
      // Ignore malformed stored value.
    }
  }, []);

  return {
    timeZone,
    setTimeZone(tz: string) {
      setTimeZoneState(tz);
      write(TZ_KEY, tz);
    },
    watchlist,
    setWatchlist(list: AssetCode[]) {
      setWatchlistState(list);
      write(WATCH_KEY, JSON.stringify(list));
    },
  };
}

export const TIME_ZONES = [
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];
