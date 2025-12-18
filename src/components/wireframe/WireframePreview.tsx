"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { LayoutTemplate, WireframeElement } from "@/lib/types";

interface WireframePreviewProps {
  template: LayoutTemplate;
  className?: string;
  compact?: boolean;
}

export function WireframePreview({ template, className, compact = false }: WireframePreviewProps) {
  return (
    <div className={cn(
      "bg-muted/30 rounded-lg p-3 border border-dashed border-muted-foreground/20",
      compact ? "p-2" : "p-3",
      className
    )}>
      <WireframeLayout structure={template.structure} elements={template.elements} compact={compact} />
    </div>
  );
}

interface WireframeLayoutProps {
  structure: string;
  elements: WireframeElement[];
  compact?: boolean;
}

function WireframeLayout({ structure, elements, compact }: WireframeLayoutProps) {
  // Render based on structure type
  switch (structure) {
    case "3-column-grid":
      return <ThreeColumnGrid elements={elements} compact={compact} />;
    case "2-column-grid":
      return <TwoColumnGrid elements={elements} compact={compact} />;
    case "vertical-list":
      return <VerticalList elements={elements} compact={compact} />;
    case "alternating-rows":
      return <AlternatingRows elements={elements} compact={compact} />;
    case "bento-grid":
      return <BentoGrid elements={elements} compact={compact} />;
    default:
      return <GenericLayout elements={elements} compact={compact} />;
  }
}

// Layout-specific renderers
function ThreeColumnGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const cardElements = elements.filter(e => e.type === 'card');

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      {/* Header */}
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* Cards */}
      <div className={cn("grid grid-cols-3 gap-2", compact && "gap-1")}>
        {cardElements.map((card, i) => {
          const repeatCount = card.repeat || 1;
          return Array.from({ length: repeatCount }).map((_, j) => (
            <WireframeCard key={`${i}-${j}`} element={card} compact={compact} />
          ));
        })}
      </div>
    </div>
  );
}

function TwoColumnGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const cardElements = elements.filter(e => e.type === 'card');

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      {/* Header */}
      <div className="text-center space-y-1">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* Cards */}
      <div className={cn("grid grid-cols-2 gap-3", compact && "gap-1.5")}>
        {cardElements.map((card, i) => {
          const repeatCount = card.repeat || 1;
          return Array.from({ length: repeatCount }).map((_, j) => (
            <WireframeCard key={`${i}-${j}`} element={card} compact={compact} size="medium" />
          ));
        })}
      </div>
    </div>
  );
}

function VerticalList({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const listElements = elements.filter(e => e.type === 'list');

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      {/* Header */}
      <div className="space-y-0.5">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* List items */}
      <div className={cn("space-y-1.5", compact && "space-y-1")}>
        {listElements.map((list, i) => {
          const repeatCount = list.repeat || 1;
          return Array.from({ length: compact ? Math.min(repeatCount, 3) : repeatCount }).map((_, j) => (
            <div key={`${i}-${j}`} className="flex items-start gap-2">
              <div className={cn(
                "rounded bg-primary/30 flex-shrink-0",
                compact ? "w-3 h-3" : "w-5 h-5"
              )} />
              <div className="flex-1 space-y-0.5">
                <div className={cn(
                  "bg-muted-foreground/40 rounded",
                  compact ? "h-1.5 w-2/3" : "h-2 w-3/4"
                )} />
                <div className={cn(
                  "bg-muted-foreground/20 rounded",
                  compact ? "h-1 w-full" : "h-1.5 w-full"
                )} />
              </div>
            </div>
          ));
        })}
      </div>
    </div>
  );
}

function AlternatingRows({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');
  const cardElements = elements.filter(e => e.type === 'card');

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      {/* Header */}
      <div className="text-center">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* Alternating rows */}
      <div className={cn("space-y-2", compact && "space-y-1")}>
        {cardElements.map((card, i) => {
          const repeatCount = card.repeat || 1;
          return Array.from({ length: compact ? Math.min(repeatCount, 2) : repeatCount }).map((_, j) => {
            const isEven = j % 2 === 0;
            return (
              <div key={`${i}-${j}`} className={cn("flex gap-2 items-center", !isEven && "flex-row-reverse")}>
                <div className={cn(
                  "bg-muted-foreground/20 rounded flex items-center justify-center",
                  compact ? "w-10 h-6" : "w-16 h-10"
                )}>
                  <ImagePlaceholder compact={compact} />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className={cn(
                    "bg-muted-foreground/40 rounded",
                    compact ? "h-1.5 w-3/4" : "h-2 w-3/4"
                  )} />
                  <div className={cn(
                    "bg-muted-foreground/20 rounded",
                    compact ? "h-1 w-full" : "h-1.5 w-full"
                  )} />
                  {!compact && (
                    <div className="h-2 w-12 bg-muted-foreground/30 rounded mt-1" />
                  )}
                </div>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}

function BentoGrid({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  const headerElements = elements.filter(e => e.type === 'heading' || e.type === 'subheading');

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      {/* Header */}
      <div className="text-center space-y-0.5">
        {headerElements.map((el, i) => (
          <WireframeElementRenderer key={i} element={el} compact={compact} />
        ))}
      </div>

      {/* Bento layout */}
      <div className={cn(
        "grid grid-cols-3 grid-rows-2 gap-1.5",
        compact && "gap-1"
      )}>
        {/* Large card spanning 2 cols */}
        <div className={cn(
          "col-span-2 row-span-1 bg-background rounded border p-1.5 space-y-0.5",
          compact && "p-1"
        )}>
          <div className={cn("w-3 h-3 bg-primary/30 rounded", compact && "w-2 h-2")} />
          <div className={cn("h-1.5 bg-muted-foreground/40 rounded w-1/2", compact && "h-1")} />
          <div className={cn("h-1 bg-muted-foreground/20 rounded w-3/4", compact && "h-0.5")} />
        </div>

        {/* Tall card spanning 2 rows */}
        <div className={cn(
          "row-span-2 bg-background rounded border p-1.5 flex flex-col justify-center space-y-0.5",
          compact && "p-1"
        )}>
          <div className={cn("w-4 h-4 bg-primary/30 rounded mx-auto", compact && "w-2 h-2")} />
          <div className={cn("h-1.5 bg-muted-foreground/40 rounded w-2/3 mx-auto", compact && "h-1")} />
        </div>

        {/* Two small cards */}
        <div className={cn(
          "bg-background rounded border p-1 flex items-center gap-1",
          compact && "p-0.5"
        )}>
          <div className={cn("w-2 h-2 bg-primary/30 rounded", compact && "w-1.5 h-1.5")} />
          <div className={cn("h-1 bg-muted-foreground/40 rounded flex-1", compact && "h-0.5")} />
        </div>
        <div className={cn(
          "bg-background rounded border p-1 flex items-center gap-1",
          compact && "p-0.5"
        )}>
          <div className={cn("w-2 h-2 bg-primary/30 rounded", compact && "w-1.5 h-1.5")} />
          <div className={cn("h-1 bg-muted-foreground/40 rounded flex-1", compact && "h-0.5")} />
        </div>
      </div>
    </div>
  );
}

function GenericLayout({ elements, compact }: { elements: WireframeElement[]; compact?: boolean }) {
  return (
    <div className={cn("space-y-1", compact && "space-y-0.5")}>
      {elements.map((el, i) => (
        <WireframeElementRenderer key={i} element={el} compact={compact} />
      ))}
    </div>
  );
}

// Card renderer
function WireframeCard({ element, compact, size = "small" }: { element: WireframeElement; compact?: boolean; size?: "small" | "medium" | "large" }) {
  const sizeClasses = {
    small: compact ? "p-1" : "p-1.5",
    medium: compact ? "p-1.5" : "p-2",
    large: compact ? "p-2" : "p-3",
  };

  return (
    <div className={cn(
      "bg-background rounded border space-y-0.5",
      sizeClasses[size]
    )}>
      {element.children?.map((child, i) => (
        <WireframeElementRenderer key={i} element={child} compact={compact} />
      ))}
    </div>
  );
}

// Element renderer
function WireframeElementRenderer({ element, compact }: { element: WireframeElement; compact?: boolean }) {
  const sizeMap = {
    small: { height: compact ? "h-1" : "h-1.5", iconSize: compact ? "w-2 h-2" : "w-3 h-3" },
    medium: { height: compact ? "h-1.5" : "h-2", iconSize: compact ? "w-3 h-3" : "w-4 h-4" },
    large: { height: compact ? "h-2" : "h-2.5", iconSize: compact ? "w-4 h-4" : "w-5 h-5" },
  };

  const size = element.size || "medium";
  const styles = sizeMap[size];

  switch (element.type) {
    case "heading":
      return (
        <div className={cn(
          "bg-muted-foreground/40 rounded",
          styles.height,
          element.align === "center" ? "mx-auto w-1/2" : element.align === "right" ? "ml-auto w-1/2" : "w-3/4"
        )} />
      );

    case "subheading":
      return (
        <div className={cn(
          "bg-muted-foreground/25 rounded",
          compact ? "h-1" : "h-1.5",
          element.align === "center" ? "mx-auto w-1/3" : element.align === "right" ? "ml-auto w-1/3" : "w-1/2"
        )} />
      );

    case "paragraph":
      return (
        <div className={cn(
          "bg-muted-foreground/20 rounded",
          compact ? "h-1" : "h-1.5",
          "w-full"
        )} />
      );

    case "icon":
      return (
        <div className={cn(
          "bg-primary/30 rounded",
          styles.iconSize
        )} />
      );

    case "button-primary":
      return (
        <div className={cn(
          "bg-primary/50 rounded",
          compact ? "h-2 w-8" : "h-3 w-12"
        )} />
      );

    case "button-secondary":
      return (
        <div className={cn(
          "bg-muted-foreground/30 rounded border",
          compact ? "h-2 w-8" : "h-3 w-12"
        )} />
      );

    case "image":
      return (
        <div className={cn(
          "bg-muted-foreground/20 rounded flex items-center justify-center",
          compact ? "h-6 w-full" : "h-10 w-full"
        )}>
          <ImagePlaceholder compact={compact} />
        </div>
      );

    case "video":
      return (
        <div className={cn(
          "bg-muted-foreground/20 rounded flex items-center justify-center",
          compact ? "h-6 w-full" : "h-10 w-full"
        )}>
          <div className={cn(
            "w-0 h-0 border-t-transparent border-b-transparent border-l-muted-foreground/40",
            compact ? "border-t-[3px] border-b-[3px] border-l-[5px]" : "border-t-[4px] border-b-[4px] border-l-[6px]"
          )} />
        </div>
      );

    case "input":
      return (
        <div className={cn(
          "bg-background border rounded",
          compact ? "h-2" : "h-3",
          "w-full"
        )} />
      );

    case "label":
      return (
        <div className={cn(
          "bg-muted-foreground/30 rounded",
          compact ? "h-0.5 w-1/4" : "h-1 w-1/3"
        )} />
      );

    default:
      return null;
  }
}

function ImagePlaceholder({ compact }: { compact?: boolean }) {
  return (
    <svg
      className={cn("text-muted-foreground/30", compact ? "w-3 h-3" : "w-4 h-4")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

export default WireframePreview;
