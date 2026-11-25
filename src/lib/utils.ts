import { siteConfig } from "@/config/site";

/**
 * Class merging (clsx-style conditionals + Tailwind conflict resolution).
 * Re-exported so app code has one import to swap if the engine ever changes.
 */
export { cn } from "cn";

type DateInput = Date | string | number;

function toDate(value: DateInput): Date | undefined {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function formatCurrency(
  amount: number,
  options: Intl.NumberFormatOptions & { currency?: string; locale?: string } = {},
): string {
  const { currency = siteConfig.currency, locale = siteConfig.locale, ...rest } = options;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    // IDR and other zero-decimal currencies read cleaner without ",00".
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...rest,
  }).format(amount);
}

export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions & { locale?: string } = {},
): string {
  const { locale = siteConfig.locale, ...rest } = options;
  return new Intl.NumberFormat(locale, rest).format(value);
}

/** Compact form for KPI tiles: 1.250.000 → "1,3 jt" (id-ID). */
export function formatCompactNumber(value: number, locale: string = siteConfig.locale): string {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}

export function formatDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions & { locale?: string } = { dateStyle: "medium" },
): string {
  const date = toDate(value);
  if (!date) return "—";
  const { locale = siteConfig.locale, ...rest } = options;
  return new Intl.DateTimeFormat(locale, { timeZone: siteConfig.timeZone, ...rest }).format(date);
}

export function formatDateTime(value: DateInput): string {
  return formatDate(value, { dateStyle: "medium", timeStyle: "short" });
}

/** "Budi Santoso" → "BS", for avatar fallbacks. */
export function getInitials(name: string, max = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, max)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
