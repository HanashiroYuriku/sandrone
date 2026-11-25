import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder for the dashboard shell while the session loads. Mirrors its layout. */
export function DashboardShellSkeleton() {
  return (
    <div className="flex min-h-svh w-full" aria-busy="true" aria-label="Loading">
      <div className="hidden w-64 shrink-0 flex-col gap-4 border-r bg-sidebar p-4 md:flex">
        <Skeleton className="h-8 w-36" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="mt-auto h-12 w-full" />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center gap-3 border-b px-4">
          <Skeleton className="size-7" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="ml-auto h-8 w-40" />
        </div>
        <div className="space-y-4 p-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-72" />
        </div>
      </div>
    </div>
  );
}

/** Placeholder for the kiosk shell while the session loads. */
export function KioskShellSkeleton() {
  return (
    <div className="flex h-dvh flex-col" aria-busy="true" aria-label="Loading">
      <div className="flex h-16 items-center gap-4 border-b px-6">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="ml-auto h-8 w-48" />
      </div>
      <div className="grid flex-1 gap-6 p-6 lg:grid-cols-[1fr_24rem]">
        <div className="grid grid-cols-2 content-start gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="aspect-square" />
          ))}
        </div>
        <Skeleton className="hidden lg:block" />
      </div>
    </div>
  );
}

/** Placeholder for the centered auth card. */
export function AuthCardSkeleton() {
  return (
    <div className="w-full space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
