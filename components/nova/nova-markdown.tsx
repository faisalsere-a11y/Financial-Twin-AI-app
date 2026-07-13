import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type NovaMarkdownProps = {
  markdown: string;
  className?: string;
};

type MarkdownBlock =
  | { kind: "paragraph"; content: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "code"; content: string; language?: string };

const inlineTokenPattern = /(\*\*[^*\n]+\*\*|`[^`\n]+`)/g;

function renderInline(content: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of content.matchAll(inlineTokenPattern)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(content.slice(cursor, index));

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`strong-${index}`}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<code key={`code-${index}`}>{token.slice(1, -1)}</code>);
    }
    cursor = index + token.length;
  }

  if (cursor < content.length) nodes.push(content.slice(cursor));
  return nodes;
}

function parseBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fenced = line.match(/^```([\w-]*)\s*$/);
    if (fenced) {
      const closingIndex = lines.findIndex((candidate, candidateIndex) => (
        candidateIndex > index && /^```\s*$/.test(candidate)
      ));
      if (closingIndex !== -1) {
        blocks.push({
          kind: "code",
          content: lines.slice(index + 1, closingIndex).join("\n"),
          language: fenced[1] || undefined
        });
        index = closingIndex + 1;
        continue;
      }
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ kind: "bullets", items });
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (
      index < lines.length
      && (lines[index] ?? "").trim()
      && !/^\s*[-*]\s+/.test(lines[index] ?? "")
      && !/^```[\w-]*\s*$/.test(lines[index] ?? "")
    ) {
      paragraph.push(lines[index] ?? "");
      index += 1;
    }
    blocks.push({ kind: "paragraph", content: paragraph.join(" ") });
  }

  return blocks;
}

export function NovaMarkdown({ markdown, className }: NovaMarkdownProps) {
  return (
    <div className={cn("space-y-3 text-sm leading-6", className)}>
      {parseBlocks(markdown).map((block, blockIndex) => {
        if (block.kind === "code") {
          return (
            <pre key={`block-${blockIndex}`} className="max-w-full overflow-x-auto rounded-xl bg-foreground/[0.06] p-3 text-xs">
              <code data-language={block.language}>{block.content}</code>
            </pre>
          );
        }

        if (block.kind === "bullets") {
          return (
            <ul key={`block-${blockIndex}`} className="list-disc space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        return <p key={`block-${blockIndex}`}>{renderInline(block.content)}</p>;
      })}
    </div>
  );
}
