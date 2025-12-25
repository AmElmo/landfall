"use client";

import React, { useState, useEffect } from "react";
import { OnboardingShell } from "@/components/layout/OnboardingShell";
import { useLandfall } from "@/lib/context";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Monitor,
  Tablet,
  Smartphone,
  FileText,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Section, SECTION_TYPES, NavCta, Navigation, Style, SectionType } from "@/lib/types";
import { useWireframeTemplates } from "@/hooks/useWireframeTemplates";
import { WireframePreview } from "@/components/wireframe/WireframePreview";

type ViewMode = "desktop" | "tablet" | "mobile";

export default function PreviewStep() {
  const { sitemap, pages, style, navigation, refreshData } = useLandfall();
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>("home");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const showAnnotations = true;

  // Refresh data when component mounts to get latest navigation settings
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const currentPage = pages[selectedPageSlug];
  const currentPageInfo = sitemap?.pages.find(
    (p) => (p.slug === "/" ? "home" : p.slug.replace(/^\//, "")) === selectedPageSlug
  );

  if (!sitemap || !style || !navigation) return null;

  // Left panel: Page navigation only
  const leftPanel = (
    <div className="space-y-4">
      <div className="space-y-2">
        {sitemap.pages.map((page) => {
          const pageSlug = page.slug === "/" ? "home" : page.slug.replace(/^\//, "");
          return (
            <button
              key={page.id}
              onClick={() => setSelectedPageSlug(pageSlug)}
              className={cn(
                "w-full px-4 py-3 rounded-lg text-left font-medium transition-colors outline-none focus:outline-none",
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
    </div>
  );

  // Right panel: View controls + Preview
  const rightPanel = (
    <div className="space-y-2 h-full flex flex-col">
      {/* View Controls at top of preview */}
      <div className="flex justify-end">
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

      {/* Preview Area */}
      <div className="bg-muted/30 rounded-xl p-3 flex justify-center overflow-hidden flex-1">
        <div
          className={cn(
            "bg-white rounded-xl shadow-2xl overflow-hidden border transition-all",
            viewMode === "desktop" && "w-[1024px] max-w-full",
            viewMode === "tablet" && "w-[768px] max-w-full",
            viewMode === "mobile" && "w-[375px] max-w-full"
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

          {/* Navbar - respects selected layout */}
          <div
            className="border-b p-4"
            style={{ backgroundColor: style.colors.background }}
          >
            {(navigation.navbar.layout === "logo-left-links-right" || !navigation.navbar.layout) && (
              <div className="flex items-center justify-between">
                <NavbarLogoPreview navigation={navigation} style={style} />
                <div className="flex items-center gap-4">
                  {viewMode !== "mobile" && navigation.navbar.links?.map((link, i) => (
                    <span key={i} className="text-sm" style={{ color: style.colors.textMuted }}>
                      {link.label}
                    </span>
                  ))}
                  {navigation.navbar.cta?.slice(0, viewMode === "mobile" ? 1 : 2).map((cta, i) => (
                    <NavbarCtaButton key={i} cta={cta} style={style} />
                  ))}
                </div>
              </div>
            )}
            {navigation.navbar.layout === "logo-left-links-center" && (
              <div className="flex items-center justify-between">
                <NavbarLogoPreview navigation={navigation} style={style} />
                <div className="flex items-center gap-4">
                  {viewMode !== "mobile" && navigation.navbar.links?.map((link, i) => (
                    <span key={i} className="text-sm" style={{ color: style.colors.textMuted }}>
                      {link.label}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {navigation.navbar.cta?.slice(0, viewMode === "mobile" ? 1 : 2).map((cta, i) => (
                    <NavbarCtaButton key={i} cta={cta} style={style} />
                  ))}
                </div>
              </div>
            )}
            {navigation.navbar.layout === "minimal" && (
              <div className="flex items-center justify-between">
                <NavbarLogoPreview navigation={navigation} style={style} />
                <div className="flex items-center gap-2">
                  {navigation.navbar.cta?.slice(0, 1).map((cta, i) => (
                    <NavbarCtaButton key={i} cta={cta} style={style} />
                  ))}
                </div>
              </div>
            )}
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

          {/* Footer - respects selected layout */}
          <div
            className="border-t p-4"
            style={{ backgroundColor: style.colors.backgroundAlt }}
          >
            {(navigation.footer.layout === "columns-simple" || !navigation.footer.layout) && (
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  {navigation.footer.columns?.slice(0, 3).map((col, i) => (
                    <div key={i}>
                      <div className="font-medium mb-1" style={{ color: style.colors.text }}>{col.heading}</div>
                      {col.links?.slice(0, 2).map((link, j) => (
                        <div key={j} style={{ color: style.colors.textMuted }}>{link.label}</div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: style.colors.border }}>
                  <div className="text-xs" style={{ color: style.colors.textMuted }}>
                    {navigation.footer.copyright || "© 2025 Your Company"}
                  </div>
                </div>
              </div>
            )}
            {navigation.footer.layout === "columns-with-logo" && (
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <NavbarLogoPreview navigation={navigation} style={style} />
                  </div>
                  <div className="flex-1 flex gap-4 text-xs">
                    {navigation.footer.columns?.slice(0, 2).map((col, i) => (
                      <div key={i}>
                        <div className="font-medium mb-1" style={{ color: style.colors.text }}>{col.heading}</div>
                        {col.links?.slice(0, 2).map((link, j) => (
                          <div key={j} style={{ color: style.colors.textMuted }}>{link.label}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center text-xs pt-2 border-t" style={{ borderColor: style.colors.border, color: style.colors.textMuted }}>
                  {navigation.footer.copyright || "© 2025 Your Company"}
                </div>
              </div>
            )}
            {navigation.footer.layout === "centered-minimal" && (
              <div className="text-center space-y-2">
                <NavbarLogoPreview navigation={navigation} style={style} />
                <div className="flex justify-center gap-3 text-xs" style={{ color: style.colors.textMuted }}>
                  {navigation.footer.columns?.flatMap(col => col.links || []).slice(0, 4).map((link, i) => (
                    <span key={i}>{link.label}</span>
                  ))}
                </div>
                <div className="text-xs" style={{ color: style.colors.textMuted }}>
                  {navigation.footer.copyright || "© 2025 Your Company"}
                </div>
              </div>
            )}
            {navigation.footer.layout === "stacked" && (
              <div className="text-center space-y-2">
                <NavbarLogoPreview navigation={navigation} style={style} />
                <div className="flex flex-col items-center gap-1 text-xs" style={{ color: style.colors.textMuted }}>
                  {navigation.footer.columns?.flatMap(col => col.links || []).slice(0, 3).map((link, i) => (
                    <span key={i}>{link.label}</span>
                  ))}
                </div>
                <div className="text-xs pt-2" style={{ color: style.colors.textMuted }}>
                  {navigation.footer.copyright || "© 2025 Your Company"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <OnboardingShell
      stepIndex={7}
      title="Preview your wireframes"
      description="Select a page to preview its wireframe structure."
      preview={rightPanel}
      widePreview
    >
      {leftPanel}
    </OnboardingShell>
  );
}

function WireframeSection({
  section,
  index,
  style,
  showAnnotations,
}: {
  section: Section;
  index: number;
  style: NonNullable<ReturnType<typeof useLandfall>["style"]>;
  showAnnotations: boolean;
  viewMode: ViewMode;
}) {
  const { templates } = useWireframeTemplates(section.type as SectionType);
  const selectedTemplate = templates.find(t => t.id === section.layoutTemplateId);

  const sectionType = section.type !== 'custom' ? SECTION_TYPES[section.type as keyof typeof SECTION_TYPES] : null;
  const displayName = section.type === 'custom' ? section.customType || 'Custom Section' : (sectionType?.name || section.type);

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <Badge
          variant="outline"
          className="text-xs"
          style={{ borderColor: style.colors.primary, color: style.colors.primary }}
        >
          {index + 1}
        </Badge>
        <span className="font-medium text-sm" style={{ color: style.colors.text }}>
          {displayName}
        </span>
      </div>

      {/* Wireframe Content - use same rendering as SectionsStep */}
      <div className="rounded-lg overflow-hidden">
        {selectedTemplate ? (
          <WireframePreview
            template={selectedTemplate}
            compact={false}
            className="min-h-[380px]"
          />
        ) : (
          <div
            className="min-h-[300px] rounded-lg p-4 flex items-center justify-center"
            style={{ backgroundColor: style.colors.backgroundAlt }}
          >
            <span className="text-sm" style={{ color: style.colors.textMuted }}>
              {displayName} section
            </span>
          </div>
        )}
      </div>

      {/* Annotations */}
      {showAnnotations && (section.copyInstructions || section.visualInstructions) && (
        <div
          className="mt-2 p-3 rounded-lg border space-y-2"
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

// Helper component for navbar logo in preview
function NavbarLogoPreview({
  navigation,
  style,
}: {
  navigation: Navigation;
  style: Style;
}) {
  if (navigation.navbar.logo.imagePath) {
    const logoSrc = navigation.navbar.logo.imagePath.startsWith('/api/assets/serve/')
      ? navigation.navbar.logo.imagePath
      : `/api/assets/serve/${navigation.navbar.logo.imagePath.replace(/^\/?(landfall\/)?assets\//, '')}`;
    return (
      <img
        src={logoSrc}
        alt="Logo"
        className="h-8 max-w-[120px] object-contain"
      />
    );
  }
  return (
    <div className="font-semibold" style={{ color: style.colors.text }}>
      {navigation.navbar.logo.value || "Logo"}
    </div>
  );
}

// Helper component for CTA buttons in preview
function NavbarCtaButton({
  cta,
  style,
}: {
  cta: NavCta;
  style: Style;
}) {
  return (
    <button
      className={cn(
        "px-3 py-1.5 text-sm rounded-lg",
        cta.style === "primary" ? "text-white" : "border"
      )}
      style={{
        backgroundColor: cta.style === "primary" ? style.colors.primary : "transparent",
        borderColor: style.colors.border,
        color: cta.style === "primary" ? "white" : style.colors.text,
      }}
    >
      {cta.label}
    </button>
  );
}
