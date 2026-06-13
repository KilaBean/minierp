export type DashboardRange = "today" | "7d" | "30d" | "month";

/** Maps a range key to the current and comparison-period boundaries. */
export function rangeWindow(range: DashboardRange) {
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "today": {
      const curStart  = startOfToday;
      const prevStart = new Date(startOfToday.getTime() - day);
      return { curStart, curEnd: now, prevStart, prevEnd: startOfToday, trendDays: 7 };
    }
    case "7d": {
      const curStart  = new Date(now.getTime() - 7 * day);
      const prevStart = new Date(now.getTime() - 14 * day);
      return { curStart, curEnd: now, prevStart, prevEnd: curStart, trendDays: 7 };
    }
    case "30d": {
      const curStart  = new Date(now.getTime() - 30 * day);
      const prevStart = new Date(now.getTime() - 60 * day);
      return { curStart, curEnd: now, prevStart, prevEnd: curStart, trendDays: 30 };
    }
    case "month":
    default: {
      const curStart  = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevEnd   = new Date(now.getFullYear(), now.getMonth(), 0);
      return { curStart, curEnd: now, prevStart, prevEnd, trendDays: 30 };
    }
  }
}

/** Number of trend days appropriate for a given range (used by the dashboard charts). */
export function rangeTrendDays(range: DashboardRange): number {
  return rangeWindow(range).trendDays;
}
