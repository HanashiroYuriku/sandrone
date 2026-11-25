import { env } from "@/config/env";

export type ThemePreference = "light" | "dark" | "system";

export interface SiteConfig {
  name: string;
  shortName: string;
  description: string;
  url: string;
  /** BCP 47 tag used by Intl formatters and the <html lang> attribute. */
  locale: string;
  /** ISO 4217 code used by formatCurrency(). */
  currency: string;
  timeZone: string;
  defaultTheme: ThemePreference;
}

export const siteConfig: SiteConfig = {
  name: "Sandrone",
  shortName: "Sandrone",
  description: "Enterprise frontend base for SaaS, ERP, Kiosk/POS and admin dashboards.",
  url: env.NEXT_PUBLIC_APP_URL,
  locale: "id-ID",
  currency: "IDR",
  timeZone: "Asia/Jakarta",
  defaultTheme: "system",
};
