import { HexagonIcon } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface BrandProps {
  className?: string;
  /** Hide the name and show only the mark. */
  compact?: boolean;
}

/** App logo mark + name. Replace the icon with your own logo. */
export function Brand({ className, compact = false }: BrandProps) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <HexagonIcon className="size-4" aria-hidden />
      </span>
      {compact ? <span className="sr-only">{siteConfig.name}</span> : siteConfig.name}
    </span>
  );
}
