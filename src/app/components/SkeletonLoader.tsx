import React from "react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted/60 dark:bg-muted/30 rounded-xl ${className || ""}`} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-12 h-4 rounded-full" />
      </div>
      <div className="space-y-2 mt-1">
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-28 h-4" />
        <Skeleton className="w-24 h-3" />
      </div>
    </div>
  );
}

export function ScheduleSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-12 h-4" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 items-center">
            <Skeleton className="w-10 h-4" />
            <Skeleton className="w-0.5 h-10" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="w-3/4 h-4" />
              <Skeleton className="w-1/2 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="w-48 h-5" />
          <Skeleton className="w-36 h-3" />
        </div>
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <div className="h-[200px] flex items-end gap-2 pt-6">
        {[20, 45, 30, 80, 50, 70, 40, 60, 35, 90, 55, 75].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export function AssignmentListSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-44 h-5" />
        <Skeleton className="w-20 h-4" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/30">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-1 h-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="w-1/3 h-4" />
                <Skeleton className="w-1/4 h-3" />
              </div>
            </div>
            <Skeleton className="w-16 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <div className="flex items-start justify-between">
            <Skeleton className="w-16 h-5" />
            <Skeleton className="w-4 h-4 rounded-full" />
          </div>
          <Skeleton className="w-3/4 h-5" />
          <div className="space-y-1.5">
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-5/6 h-3" />
            <Skeleton className="w-2/3 h-3" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-12 h-4" />
            <Skeleton className="w-10 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Banner Skeleton */}
      <div className="relative overflow-hidden rounded-2xl bg-muted/40 dark:bg-muted/20 p-8 flex flex-col gap-3 min-h-[140px] animate-pulse">
        <Skeleton className="w-48 h-4" />
        <Skeleton className="w-64 h-8" />
        <Skeleton className="w-96 h-4" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartSkeleton />
        </div>
        <div>
          <ScheduleSkeleton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AssignmentListSkeleton />
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <Skeleton className="w-32 h-5" />
          <div className="h-[160px] flex items-end gap-3 px-4">
            {[30, 50, 40, 80, 60, 70].map((h, i) => (
              <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
