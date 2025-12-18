"use client";

import React, { useState } from "react";
import { OnboardingShell } from "@/components/layout/OnboardingShell";
import { useLandfall } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  FileText,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Section, SECTION_TYPES } from "@/lib/types";

type ViewMode = "desktop" | "tablet" | "mobile";

export default function PreviewStep() {
  const { sitemap, pages, style, navigation } = useLandfall();
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>("home");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const showAnnotations = true;

  const currentPage = pages[selectedPageSlug];
  const currentPageInfo = sitemap?.pages.find(
    (p) => (p.slug === "/" ? "home" : p.slug.replace(/^\//, "")) === selectedPageSlug
  );

  if (!sitemap || !style || !navigation) return null;

  return (
    <OnboardingShell
      stepIndex={6}
      title="Preview your wireframes"
      description="Review the structure of your landing pages before generating prompts."
      preview={null}
    >
      {/* Full width preview since this is the preview step */}
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Page Selector */}
          <div className="flex gap-2">
            {sitemap.pages.map((page) => {
              const pageSlug = page.slug === "/" ? "home" : page.slug.replace(/^\//, "");
              return (
                <button
                  key={page.id}
                  onClick={() => setSelectedPageSlug(pageSlug)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    selectedPageSlug === pageSlug
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {page.name}
                </button>
              );
            })}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("desktop")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "desktop" ? "bg-background shadow-sm" : ""
                )}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("tablet")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "tablet" ? "bg-background shadow-sm" : ""
                )}
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "mobile" ? "bg-background shadow-sm" : ""
                )}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Preview Area */}
        <div className="bg-muted/30 rounded-xl p-4 min-h-[500px] flex justify-center">
          <div
            className={cn(
              "bg-white rounded-xl shadow-2xl overflow-hidden border transition-all",
              viewMode === "desktop" && "w-full max-w-4xl",
              viewMode === "tablet" && "w-[768px]",
              viewMode === "mobile" && "w-[375px]"
            )}
          >
            {/* Browser Chrome */}
            <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-background rounded-md px-4 py-1.5 text-xs text-muted-foreground">
                  {currentPageInfo?.name || "Page"}
                </div>
              </div>
            </div>

            {/* Navbar */}
            <div
              className="border-b p-4 flex items-center justify-between"
              style={{ backgroundColor: style.colors.background }}
            >
              <div className="font-semibold" style={{ color: style.colors.text }}>
                {navigation.navbar.logo.value || "Logo"}
              </div>
              <div className="flex items-center gap-4">
                {navigation.navbar.links.slice(0, viewMode === "mobile" ? 0 : 3).map((link, i) => (
                  <span
                    key={i}
                    className="text-sm"
                    style={{ color: style.colors.textMuted }}
                  >
                    {link.label}
                  </span>
                ))}
                {navigation.navbar.cta.slice(0, viewMode === "mobile" ? 1 : 2).map((cta, i) => (
                  <button
                    key={i}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-lg",
                      cta.style === "primary" ? "text-white" : "border"
                    )}
                    style={{
                      backgroundColor:
                        cta.style === "primary" ? style.colors.primary : "transparent",
                      borderColor: style.colors.border,
                      color:
                        cta.style === "primary" ? "white" : style.colors.text,
                    }}
                  >
                    {cta.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Content */}
            <ScrollArea className="h-[400px]">
              <div
                className="p-4 space-y-4"
                style={{ backgroundColor: style.colors.background }}
              >
                {(currentPage?.sections || []).map((section, index) => (
                  <WireframeSection
                    key={section.id}
                    section={section}
                    index={index}
                    style={style}
                    showAnnotations={showAnnotations}
                    viewMode={viewMode}
                  />
                ))}

                {(!currentPage?.sections || currentPage.sections.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    No sections added to this page
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div
              className="border-t p-4"
              style={{ backgroundColor: style.colors.backgroundAlt }}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs" style={{ color: style.colors.textMuted }}>
                  {navigation.footer.copyright || "© 2024 Your Company"}
                </div>
                <div className="flex gap-2">
                  {navigation.footer.columns.slice(0, 2).map((col, i) => (
                    <span
                      key={i}
                      className="text-xs"
                      style={{ color: style.colors.textMuted }}
                    >
                      {col.heading}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}

function WireframeSection({
  section,
  index,
  style,
  showAnnotations,
  viewMode,
}: {
  section: Section;
  index: number;
  style: NonNullable<ReturnType<typeof useLandfall>["style"]>;
  showAnnotations: boolean;
  viewMode: ViewMode;
}) {
  const sectionType = SECTION_TYPES[section.type as keyof typeof SECTION_TYPES];
  const variant = sectionType?.variants.find((v) => v.id === section.layoutVariant);

  return (
    <div
      className="relative border-2 border-dashed rounded-xl p-4"
      style={{ borderColor: style.colors.border }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <Badge
          variant="outline"
          className="text-xs"
          style={{ borderColor: style.colors.primary, color: style.colors.primary }}
        >
          {index + 1}
        </Badge>
        <span className="font-medium text-sm" style={{ color: style.colors.text }}>
          {sectionType?.name || section.type}
        </span>
        <span className="text-xs" style={{ color: style.colors.textMuted }}>
          {variant?.name}
        </span>
      </div>

      {/* Wireframe Content */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: style.colors.backgroundAlt }}
      >
        {renderWireframe(section, style, viewMode)}
      </div>

      {/* Annotations */}
      {showAnnotations && (section.copyInstructions || section.visualInstructions) && (
        <div
          className="mt-3 p-3 rounded-lg border space-y-2"
          style={{
            backgroundColor: `${style.colors.primary}10`,
            borderColor: `${style.colors.primary}30`,
          }}
        >
          {section.copyInstructions && (
            <div className="flex items-start gap-2 text-xs">
              <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: style.colors.primary }} />
              <span style={{ color: style.colors.text }}>{section.copyInstructions}</span>
            </div>
          )}
          {section.visualInstructions && (
            <div className="flex items-start gap-2 text-xs">
              <Image className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: style.colors.primary }} />
              <span style={{ color: style.colors.text }}>{section.visualInstructions}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderWireframe(
  section: Section,
  style: NonNullable<ReturnType<typeof useLandfall>["style"]>,
  viewMode: ViewMode
) {
  const isMobile = viewMode === "mobile";

  switch (section.type) {
    case "hero":
      return (
        <div className={cn("flex gap-6", isMobile && "flex-col")}>
          <div className="flex-1 space-y-3">
            <div className="h-6 rounded w-3/4" style={{ backgroundColor: style.colors.border }} />
            <div className="h-4 rounded w-full" style={{ backgroundColor: `${style.colors.border}80` }} />
            <div className="h-4 rounded w-2/3" style={{ backgroundColor: `${style.colors.border}80` }} />
            <div className="flex gap-2 mt-4">
              <div className="h-10 w-28 rounded-lg" style={{ backgroundColor: style.colors.primary }} />
              <div className="h-10 w-28 rounded-lg border" style={{ borderColor: style.colors.border }} />
            </div>
          </div>
          {!isMobile && (
            <div className="w-1/2 h-40 rounded-lg flex items-center justify-center" style={{ backgroundColor: style.colors.border }}>
              <Image className="h-8 w-8" style={{ color: style.colors.textMuted }} />
            </div>
          )}
        </div>
      );

    case "features":
      return (
        <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-3")}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: style.colors.background }}>
              <div className="w-10 h-10 rounded-lg mb-3" style={{ backgroundColor: style.colors.primary }} />
              <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: style.colors.border }} />
              <div className="h-3 rounded w-full" style={{ backgroundColor: `${style.colors.border}60` }} />
              <div className="h-3 rounded w-2/3 mt-1" style={{ backgroundColor: `${style.colors.border}60` }} />
            </div>
          ))}
        </div>
      );

    case "testimonials":
      return (
        <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-3")}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: style.colors.background }}>
              <div className="h-3 rounded w-full mb-1" style={{ backgroundColor: `${style.colors.border}60` }} />
              <div className="h-3 rounded w-full mb-1" style={{ backgroundColor: `${style.colors.border}60` }} />
              <div className="h-3 rounded w-3/4 mb-4" style={{ backgroundColor: `${style.colors.border}60` }} />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: style.colors.border }} />
                <div>
                  <div className="h-3 rounded w-16 mb-1" style={{ backgroundColor: style.colors.border }} />
                  <div className="h-2 rounded w-12" style={{ backgroundColor: `${style.colors.border}60` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case "cta":
      return (
        <div className="text-center py-8">
          <div className="h-6 rounded w-1/2 mx-auto mb-3" style={{ backgroundColor: style.colors.border }} />
          <div className="h-4 rounded w-1/3 mx-auto mb-6" style={{ backgroundColor: `${style.colors.border}60` }} />
          <div className="h-12 w-36 rounded-lg mx-auto" style={{ backgroundColor: style.colors.primary }} />
        </div>
      );

    case "pricing":
      return (
        <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-3")}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn("p-4 rounded-lg border-2", i === 2 && "border-primary")} style={{ backgroundColor: style.colors.background, borderColor: i === 2 ? style.colors.primary : style.colors.border }}>
              <div className="h-4 rounded w-1/2 mb-2" style={{ backgroundColor: style.colors.border }} />
              <div className="h-8 rounded w-2/3 mb-4" style={{ backgroundColor: style.colors.border }} />
              <div className="space-y-2 mb-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-3 rounded w-full" style={{ backgroundColor: `${style.colors.border}60` }} />
                ))}
              </div>
              <div className="h-10 rounded-lg" style={{ backgroundColor: i === 2 ? style.colors.primary : style.colors.border }} />
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="space-y-3 py-4">
          <div className="h-5 rounded w-1/2 mx-auto" style={{ backgroundColor: style.colors.border }} />
          <div className="h-4 rounded w-2/3 mx-auto" style={{ backgroundColor: `${style.colors.border}60` }} />
          <div className="h-4 rounded w-1/2 mx-auto" style={{ backgroundColor: `${style.colors.border}60` }} />
        </div>
      );
  }
}
