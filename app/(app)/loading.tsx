import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div
      className="mx-auto grid max-w-[1280px] gap-6"
      role="status"
      aria-busy="true"
      aria-label="Loading financial workspace"
    >
      <div className="grid gap-3 py-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border bg-card p-5 shadow-glass">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-8 w-32" />
            <Skeleton className="mt-3 h-4 w-20" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border bg-card p-5 shadow-glass">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-4 w-64 max-w-full" />
            <Skeleton className="mt-6 h-72 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
