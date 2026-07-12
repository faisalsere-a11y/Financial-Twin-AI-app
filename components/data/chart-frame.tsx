"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export function ChartFrame({
  title,
  description,
  summary,
  action,
  children,
  className
}: {
  title: string;
  description: string;
  summary: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const summaryId = `${id}-summary`;

  return (
    <figure
      aria-labelledby={titleId}
      aria-describedby={`${descriptionId} ${summaryId}`}
      className={cn("rounded-2xl border border-border bg-card shadow-glass", className)}
    >
      <figcaption className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id={titleId} className="text-sm font-black tracking-tight text-foreground">{title}</h2>
          <p id={descriptionId} className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        {action}
      </figcaption>
      <p id={summaryId} className="sr-only">{summary}</p>
      <div className="p-5">{children}</div>
    </figure>
  );
}
