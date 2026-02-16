"use client";

// Use dist path for Next.js bundler compatibility
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/prism";
import { TerminalIcon, CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

// ---------------------------------------------------------------------------
// Custom theme matching the project's purple/indigo palette
//
// Background:     oklch(0.145 0 0)  → #1a1a1a
// Card:           oklch(0.205 0 0)  → #2e2e2e
// Primary:        oklch(0.59 0.20 277) → ~#7c5cfc (purple)
// Chart-1 light:  oklch(0.79 0.10 275) → ~#b4a0f0 (lavender)
// Chart-2 mid:    oklch(0.68 0.16 277) → ~#9578f0 (medium purple)
// Chart-4 deep:   oklch(0.51 0.23 277) → ~#5b3ed4 (deep indigo)
// Muted fg:       oklch(0.708 0 0)     → ~#a3a3a3
// Foreground:     oklch(0.985 0 0)     → ~#fafafa
// ---------------------------------------------------------------------------

const theme: Record<string, CSSProperties> = {
  'code[class*="language-"]': {
    color: "#d4d4d8",                    // zinc-300 — base text
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    lineHeight: "1.6",
    tabSize: 2,
  },
  'pre[class*="language-"]': {
    color: "#d4d4d8",
    background: "transparent",
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    lineHeight: "1.6",
    tabSize: 2,
    overflow: "auto",
    margin: 0,
    padding: "1.25rem",
  },
  comment:       { color: "#6b6b7b", fontStyle: "italic" },  // muted gray-purple
  prolog:        { color: "#6b6b7b" },
  doctype:       { color: "#6b6b7b" },
  cdata:         { color: "#6b6b7b" },
  punctuation:   { color: "#8b8b9e" },                        // lighter gray
  property:      { color: "#b4a0f0" },                        // chart-1 (lavender)
  tag:           { color: "#b4a0f0" },
  constant:      { color: "#b4a0f0" },
  symbol:        { color: "#b4a0f0" },
  deleted:       { color: "#f87171" },                        // red for deleted
  boolean:       { color: "#c4b5fd" },                        // violet-300
  number:        { color: "#c4b5fd" },
  selector:      { color: "#a5d6a7" },                        // soft green
  "attr-name":   { color: "#9578f0" },                        // chart-2 (medium purple)
  string:        { color: "#a5d6a7" },                        // soft green for strings
  char:          { color: "#a5d6a7" },
  builtin:       { color: "#9578f0" },                        // chart-2
  inserted:      { color: "#a5d6a7" },
  operator:      { color: "#e0d4fc" },                        // light lavender
  entity:        { color: "#e0d4fc", cursor: "help" },
  url:           { color: "#7c9cf0" },                        // soft blue
  variable:      { color: "#d4d4d8" },                        // base text
  atrule:        { color: "#7c5cfc" },                        // primary purple
  "attr-value":  { color: "#a5d6a7" },
  keyword:       { color: "#7c5cfc" },                        // primary purple
  function:      { color: "#9578f0" },                        // chart-2
  "class-name":  { color: "#b4a0f0" },                        // chart-1
  regex:         { color: "#f0a875" },                        // warm amber
  important:     { color: "#f0a875", fontWeight: "bold" },
  bold:          { fontWeight: "bold" },
  italic:        { fontStyle: "italic" },
};

// ---------------------------------------------------------------------------
// CodeBlock component
// ---------------------------------------------------------------------------

interface CodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
  className?: string;
}

export function CodeBlock({
  children,
  language = "typescript",
  filename,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50",
        className,
      )}
      style={{ background: "oklch(0.16 0 0)" }}
    >
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2 bg-background/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono">
            {filename || language}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
        >
          {copied ? (
            <CheckIcon className="h-3.5 w-3.5 text-chart-3" />
          ) : (
            <CopyIcon className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <div className="p-0 text-sm">
        <SyntaxHighlighter
          language={language}
          style={theme}
          customStyle={{
            margin: 0,
            padding: "1.25rem",
            background: "transparent",
            fontSize: "0.875rem",
          }}
        >
          {children.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
