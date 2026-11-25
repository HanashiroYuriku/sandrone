import { useMediaQuery } from "@/hooks/use-media-query";

/** Matches Tailwind's `md` breakpoint: below it the sidebar becomes a Sheet drawer. */
export const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
