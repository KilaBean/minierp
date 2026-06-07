import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "GHS",
  locale: string = "en-GH"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "short", day: "numeric",
    ...options,
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d       = typeof date === "string" ? new Date(date) : date;
  const now     = new Date();
  const diffMs  = now.getTime() - d.getTime();
  const diffSecs  = Math.floor(diffMs / 1000);
  const diffMins  = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays  = Math.floor(diffHours / 24);

  if (diffSecs  < 60) return "just now";
  if (diffMins  < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays  < 7)  return `${diffDays}d ago`;
  return formatDate(d);
}

export function generateSaleNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random    = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `INV-${timestamp}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Fixed: use a loose generic so typed callbacks (v: string) don't conflict
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}