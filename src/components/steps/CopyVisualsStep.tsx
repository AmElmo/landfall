"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLandfall } from "@/lib/context";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Layers,
  FileText,
  Check,
  X,
  ArrowLeft,
  Loader2,
  Palette,
  MessageSquare,
  Map,
  Menu,
  Eye,
  Wand2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Section, SECTION_TYPES, SectionType, SectionInspiration, StyleColors, STEPS, ImageInspiration } from "@/lib/types";
import { useWireframeTemplates } from "@/hooks/useWireframeTemplates";
import { WireframePreview } from "@/components/wireframe/WireframePreview";
import { InspirationUploader, Inspiration } from "@/components/shared/InspirationUploader";
import { ImageInspirationEditor } from "@/components/shared/ImageInspirationEditor";

// Map step slugs to icons
const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  style: Palette,
  tone: MessageSquare,
  sitemap: Map,
  sections: Layers,
  'copy-visuals': FileText,
  navigation: Menu,
  preview: Eye,
  build: Wand2,
};

export default function CopyVisualsStep() {
  const router = useRouter();
  const { sitemap, pages, updatePage, style, isSaving, setCurrentStep } = useLandfall();
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>("home");
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [editingImageInspiration, setEditingImageInspiration] = useState<{
    sectionId: string;
    elementRole: string;
  } | null>(null);

  const stepIndex = 5;
  const totalSteps = STEPS.length;

  const currentPage = pages[selectedPageSlug];
  const sections = currentPage?.sections || [];

  const navigateToStep = (stepId: number) => {
    const step = STEPS.find((s) => s.id === stepId);
    if (step) {
      setCurrentStep(stepId);
      router.push(`/step/${step.slug}`);
    }
  };

  const handleBack = () => {
    if (stepIndex > 1) {
      navigateToStep(stepIndex - 1);
    }
  };

  const handleNext = () => {
    if (stepIndex < totalSteps) {
      navigateToStep(stepIndex + 1);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    if (currentPage) {
      updatePage(selectedPageSlug, {
        sections: currentPage.sections.map((s) =>
          s.id === sectionId ? { ...s, ...updates } : s
        ),
      });
      if (selectedSection?.id === sectionId) {
        setSelectedSection({ ...selectedSection, ...updates });
      }
    }
  };

  // Image inspiration handlers
  const handleImageClick = (sectionId: string, elementRole: string) => {
    setEditingImageInspiration({ sectionId, elementRole });
  };

  const getEditingSection = () => {
    if (!editingImageInspiration) return null;
    return sections.find(s => s.id === editingImageInspiration.sectionId);
  };

  const getEditingInspiration = () => {
    const section = getEditingSection();
    if (!section || !editingImageInspiration) return undefined;
    return section.imageInspirations?.find(
      i => i.elementRole === editingImageInspiration.elementRole
    );
  };

  const handleSaveImageInspiration = (inspiration: ImageInspiration) => {
    if (!editingImageInspiration) return;
    const section = getEditingSection();
    if (!section) return;

    const existingInspirations = section.imageInspirations || [];
    const existingIndex = existingInspirations.findIndex(
      i => i.elementRole === inspiration.elementRole
    );

    let newInspirations: ImageInspiration[];
    if (existingIndex >= 0) {
      newInspirations = [...existingInspirations];
      newInspirations[existingIndex] = inspiration;
    } else {
      newInspirations = [...existingInspirations, inspiration];
    }

    updateSection(editingImageInspiration.sectionId, { imageInspirations: newInspirations });
    setEditingImageInspiration(null);
  };

  const handleDeleteImageInspiration = () => {
    if (!editingImageInspiration) return;
    const section = getEditingSection();
    if (!section) return;

    const newInspirations = (section.imageInspirations || []).filter(
      i => i.elementRole !== editingImageInspiration.elementRole
    );
    updateSection(editingImageInspiration.sectionId, { imageInspirations: newInspirations });
    setEditingImageInspiration(null);
  };

  // Helper to check if a section has customizations
  const hasCustomizations = (section: Section) => {
    return Boolean(
      section.copyInstructions?.trim() ||
      (section.inspirations && section.inspirations.length > 0) ||
      (section.imageInspirations && section.imageInspirations.length > 0)
    );
  };

  if (!sitemap) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header with step navigation */}
      <div className="border-b bg-background px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <div className="flex items-center gap-3 min-w-[100px]">
            {stepIndex > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          {/* Step Progress Icons */}
          <div className="flex items-center">
            {STEPS.map((step, idx) => {
              const StepIcon = STEP_ICONS[step.slug];
              const isActive = idx + 1 === stepIndex;
              const isCompleted = idx + 1 < stepIndex;
              const isLast = idx === STEPS.length - 1;

              return (
                <React.Fragment key={step.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => navigateToStep(step.id)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/50",
                          isActive
                            ? "bg-primary text-primary-foreground scale-110 shadow-md"
                            : isCompleted
                            ? "bg-primary/20 text-primary hover:bg-primary/30"
                            : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                        )}
                      >
                        {StepIcon && <StepIcon className="h-4 w-4" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8}>
                      <span className="font-medium">{step.name}</span>
                      <span className="ml-1.5 text-muted-foreground">({idx + 1}/{STEPS.length})</span>
                    </TooltipContent>
                  </Tooltip>
                  {!isLast && (
                    <div
                      className={cn(
                        "w-6 h-0.5 mx-1",
                        idx + 1 < stepIndex
                          ? "bg-primary/40"
                          : "bg-muted"
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 min-w-[100px] justify-end">
            <Button size="sm" onClick={handleNext} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Sub-header with centered page tabs */}
      <div className="border-b bg-background/80 backdrop-blur px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          {/* Centered Page Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Pages:</span>
            <div className="flex gap-1.5 overflow-x-auto outline-none focus:outline-none" tabIndex={-1}>
              {sitemap.pages.map((page) => {
                const pageSlug = page.slug === "/" ? "home" : page.slug.replace(/^\//, "");
                const isSelected = selectedPageSlug === pageSlug;
                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      setSelectedPageSlug(pageSlug);
                      setSelectedSection(null);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus:outline-none",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {page.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable Preview */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full p-8 flex justify-center">
          <ContentPreview
            sections={sections}
            pageName={
              sitemap.pages.find(
                (p) =>
                  (p.slug === "/" ? "home" : p.slug.replace(/^\//, "")) === selectedPageSlug
              )?.name || "Page"
            }
            activeSectionId={selectedSection?.id || null}
            onSectionClick={(section) => setSelectedSection(section)}
            onImageClick={handleImageClick}
            styleColors={style?.colors}
            hasCustomizations={hasCustomizations}
          />
        </div>
      </div>

      {/* Floating Section Content Editor Panel */}
      {selectedSection && (
        <FloatingSectionContentEditor
          section={selectedSection}
          onUpdate={(updates) => updateSection(selectedSection.id, updates)}
          onClose={() => setSelectedSection(null)}
        />
      )}

      {/* Image Inspiration Editor Dialog */}
      <ImageInspirationEditor
        open={editingImageInspiration !== null}
        onOpenChange={(open) => !open && setEditingImageInspiration(null)}
        elementRole={editingImageInspiration?.elementRole || ""}
        inspiration={getEditingInspiration()}
        onSave={handleSaveImageInspiration}
        onDelete={getEditingInspiration() ? handleDeleteImageInspiration : undefined}
      />
    </div>
  );
}

// Floating section content editor panel - focused on copy and visuals only
function FloatingSectionContentEditor({
  section,
  onUpdate,
  onClose,
}: {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
  onClose: () => void;
}) {
  const isCustomSection = section.type === 'custom';
  const sectionType = !isCustomSection ? SECTION_TYPES[section.type as keyof typeof SECTION_TYPES] : null;

  return (
    <div className="fixed right-6 top-[140px] bottom-6 w-[400px] bg-background border rounded-xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-muted/30">
        <div>
          <div className="font-medium">
            {isCustomSection ? (section.customType || 'Custom Section') : (sectionType?.name || section.type)}
          </div>
          <div className="text-sm text-muted-foreground">
            Content & Visuals
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Helpful prompt */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p>
                Describe what content this section should contain. Click on images in the preview to add visual references.
              </p>
            </div>
          </div>

          {/* Copy Instructions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Copy Instructions</Label>
            </div>
            <Textarea
              value={section.copyInstructions}
              onChange={(e) => onUpdate({ copyInstructions: e.target.value })}
              placeholder="Describe what the text content should communicate. What key messages, tone, or specific phrases should be included?"
              className="min-h-[120px] text-sm"
            />
          </div>

          {/* Section Inspirations */}
          <InspirationUploader
            inspirations={section.inspirations as Inspiration[]}
            onUpdate={(inspirations) => onUpdate({ inspirations: inspirations as SectionInspiration[] })}
            title="Visual Style Inspirations"
            description="Add screenshots or URLs for overall section style/vibe reference."
            uploadCategory="section-inspirations"
          />
        </div>
      </div>
    </div>
  );
}

// Content Preview component - scrollable wireframe preview without zoom
function ContentPreview({
  sections,
  pageName,
  activeSectionId,
  onSectionClick,
  onImageClick,
  styleColors,
  hasCustomizations,
}: {
  sections: Section[];
  pageName: string;
  activeSectionId: string | null;
  onSectionClick?: (section: Section) => void;
  onImageClick?: (sectionId: string, elementRole: string) => void;
  styleColors?: StyleColors;
  hasCustomizations: (section: Section) => boolean;
}) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to active section when it changes
  useEffect(() => {
    if (activeSectionId && sectionRefs.current[activeSectionId]) {
      sectionRefs.current[activeSectionId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeSectionId]);

  // Create CSS variables from style colors
  const styleVars = styleColors ? {
    '--preview-primary': styleColors.primary,
    '--preview-primary-light': styleColors.primaryLight,
    '--preview-background': styleColors.background,
    '--preview-background-alt': styleColors.backgroundAlt,
    '--preview-text': styleColors.text,
    '--preview-text-muted': styleColors.textMuted,
    '--preview-border': styleColors.border,
  } as React.CSSProperties : {};

  return (
    <div className="w-[800px]">
      <div
        className="rounded-xl shadow-2xl overflow-hidden border"
        style={{
          backgroundColor: styleColors?.background || 'white',
          borderColor: styleColors?.border || undefined,
          ...styleVars,
        }}
      >
        {/* Browser Chrome */}
        <div
          className="px-4 py-2.5 flex items-center gap-2 border-b"
          style={{
            backgroundColor: styleColors?.backgroundAlt || undefined,
            borderColor: styleColors?.border || undefined,
          }}
        >
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="rounded-md px-4 py-1.5 text-sm font-medium bg-white text-neutral-500 border border-neutral-200">
              /{pageName.toLowerCase().replace(/\s+/g, '-')}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="p-4 space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              ref={(el) => { sectionRefs.current[section.id] = el; }}
            >
              <ContentSectionCard
                section={section}
                isActive={section.id === activeSectionId}
                onClick={onSectionClick ? () => onSectionClick(section) : undefined}
                onImageClick={onImageClick ? (role) => onImageClick(section.id, role) : undefined}
                hasCustomizations={hasCustomizations(section)}
              />
            </div>
          ))}

          {sections.length === 0 && (
            <div
              className="text-center py-16 border-2 border-dashed rounded-lg"
              style={{
                color: styleColors?.textMuted || undefined,
                borderColor: styleColors?.border || undefined,
              }}
            >
              <Layers className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-2">No sections yet</p>
              <p className="text-xs text-muted-foreground">
                Go back to the Sections step to add sections first.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Content section card with customization badge
function ContentSectionCard({
  section,
  isActive = false,
  onClick,
  onImageClick,
  hasCustomizations,
}: {
  section: Section;
  isActive?: boolean;
  onClick?: () => void;
  onImageClick?: (elementRole: string) => void;
  hasCustomizations: boolean;
}) {
  const { templates } = useWireframeTemplates(section.type as SectionType);

  // Find the selected template if one exists
  const selectedTemplate = templates.find(t => t.id === section.layoutTemplateId);

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg group relative transition-all duration-200",
        onClick && "cursor-pointer",
        isActive
          ? "ring-[3px] ring-primary"
          : "hover:ring-[3px] hover:ring-primary/60"
      )}
    >
      {/* Customization Badge */}
      {hasCustomizations && (
        <div className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md">
          <Check className="h-3 w-3" />
        </div>
      )}

      {/* Wireframe representation */}
      <div className="rounded-lg overflow-hidden bg-neutral-100">
        {selectedTemplate ? (
          <WireframePreview
            template={selectedTemplate}
            compact={false}
            className="min-h-[420px]"
            interactive={true}
            imageInspirations={section.imageInspirations}
            onVisualClick={(role) => onImageClick?.(role)}
          />
        ) : (
          <div className="min-h-[420px] flex items-center justify-center p-8 bg-neutral-100">
            <DefaultSectionPlaceholder type={section.type} />
          </div>
        )}
      </div>
    </div>
  );
}

// Default placeholder for sections without template support
function DefaultSectionPlaceholder({ type }: { type: string }) {
  const sectionType = SECTION_TYPES[type as keyof typeof SECTION_TYPES];

  return (
    <div className="text-center space-y-2">
      <Layers className="h-8 w-8 mx-auto text-neutral-400" />
      <p className="font-medium text-neutral-600">{sectionType?.name || type}</p>
      <p className="text-sm text-neutral-400">Template not available</p>
    </div>
  );
}
