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
      className={cn("min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-glass", className)}
    >
      <figcaption className="flex min-w-0 flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id={titleId} className="break-words text-sm font-black tracking-tight text-foreground">{title}</h2>
          <p id={descriptionId} className="mt-1 break-words text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        {action ? <div className="min-w-0">{action}</div> : null}
      </figcaption>
      <p id={summaryId} className="sr-only">{summary}</p>
      <div className="min-w-0 overflow-hidden p-5">{children}</div>
    </figure>
  );
}
