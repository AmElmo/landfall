"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLandfall } from "@/lib/context";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Plus,
  Trash2,
  GripVertical,
  Layers,
  FileText,
  Check,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ArrowLeft,
  Loader2,
  Palette,
  MessageSquare,
  Map,
  Menu,
  Eye,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Section, SECTION_TYPES, SectionType, StyleColors, STEPS } from "@/lib/types";
import { useWireframeTemplates } from "@/hooks/useWireframeTemplates";
import { WireframePreview } from "@/components/wireframe/WireframePreview";

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

// Hook for smooth drag-and-drop reordering
function useSortable<T>(
  items: T[],
  onReorder: (newItems: T[]) => void
) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [displayItems, setDisplayItems] = useState(items);

  // Sync displayItems with items when not dragging
  useEffect(() => {
    if (draggedIndex === null) {
      setDisplayItems(items);
    }
  }, [items, draggedIndex]);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Only update if the index changed
    if (overIndex !== index) {
      setOverIndex(index);

      // Immediately reorder the display items for visual feedback
      setDisplayItems((prev) => {
        const newItems = [...prev];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);
        return newItems;
      });

      // Update the dragged index to track where the item now is
      setDraggedIndex(index);
    }
  }, [draggedIndex, overIndex]);

  const handleDragEnd = useCallback(() => {
    if (draggedIndex !== null) {
      // Commit the reorder
      onReorder(displayItems);
    }
    setDraggedIndex(null);
    setOverIndex(null);
  }, [draggedIndex, displayItems, onReorder]);

  return {
    displayItems,
    draggedIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}

// Section types that have wireframe templates available
const SECTION_TYPES_WITH_TEMPLATES: SectionType[] = [
  'hero',
  'logos',
  'features',
  'how-it-works',
  'testimonials',
  'pricing',
  'faq',
  'cta',
  'team',
  'stats',
  'contact',
  'content'
];

// Zoom levels for canvas
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
const DEFAULT_ZOOM = 0.75;

export default function SectionsStep() {
  const router = useRouter();
  const { sitemap, pages, updatePage, style, isSaving, setCurrentStep } = useLandfall();
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>("home");
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState<SectionType | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);

  const stepIndex = 4;
  const totalSteps = STEPS.length;

  const currentPage = pages[selectedPageSlug];
  const sections = currentPage?.sections || [];

  // Use the sortable hook for smooth drag-and-drop
  const handleReorderSections = useCallback((newSections: Section[]) => {
    const reorderedSections = newSections.map((s, i) => ({ ...s, order: i + 1 }));
    updatePage(selectedPageSlug, { sections: reorderedSections });
  }, [selectedPageSlug, updatePage]);

  const {
    displayItems: displaySections,
    draggedIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useSortable(sections, handleReorderSections);

  const generateId = () => `section_${Date.now()}`;

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

  const addSection = (type: SectionType, variant: string, templateId?: string, atIndex?: number) => {
    const newSection: Section = {
      id: generateId(),
      type,
      layoutVariant: variant,
      layoutTemplateId: templateId,
      order: ((currentPage?.sections?.length) || 0) + 1,
      copyInstructions: "",
      visualInstructions: "",
      inspirations: [],
    };

    let updatedSections: Section[];
    if (atIndex !== undefined && atIndex >= 0) {
      // Insert at specific index
      const currentSections = currentPage?.sections || [];
      updatedSections = [
        ...currentSections.slice(0, atIndex),
        newSection,
        ...currentSections.slice(atIndex)
      ].map((s, i) => ({ ...s, order: i + 1 }));
    } else {
      // Append to end
      updatedSections = [...(currentPage?.sections || []), newSection];
    }

    updatePage(selectedPageSlug, { sections: updatedSections });
    setIsAddingSection(false);
    setSelectedSectionType(null);
    setInsertAtIndex(null);
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    if (currentPage) {
      updatePage(selectedPageSlug, {
        sections: currentPage.sections.map((s) =>
          s.id === sectionId ? { ...s, ...updates } : s
        ),
      });
      if (editingSection?.id === sectionId) {
        setEditingSection({ ...editingSection, ...updates });
      }
    }
  };

  const deleteSection = (sectionId: string) => {
    if (currentPage) {
      updatePage(selectedPageSlug, {
        sections: currentPage.sections
          .filter((s) => s.id !== sectionId)
          .map((s, i) => ({ ...s, order: i + 1 })),
      });
      if (editingSection?.id === sectionId) {
        setEditingSection(null);
      }
    }
  };

  // Zoom handlers
  const zoomIn = () => {
    const currentIndex = ZOOM_LEVELS.findIndex(z => z >= zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const zoomOut = () => {
    const currentIndex = ZOOM_LEVELS.findIndex(z => z >= zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const resetZoom = () => {
    setZoom(DEFAULT_ZOOM);
  };

  // Handle wheel zoom with trackpad (very low sensitivity for smooth control)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      // Use very small delta for smooth trackpad zooming
      const delta = e.deltaY > 0 ? -0.01 : 0.01;
      setZoom(prev => Math.max(0.25, Math.min(2, prev + delta)));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

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
                      setEditingSection(null);
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

      {/* Full Canvas Area */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto bg-[radial-gradient(circle_at_1px_1px,_rgb(0_0_0_/_0.05)_1px,_transparent_0)] [background-size:24px_24px] relative"
      >
        <div className="min-h-full p-8 flex justify-center">
          <div
            className="transition-transform duration-200 origin-top"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Canvas Preview */}
            <CanvasPreview
              sections={displaySections}
              pageName={
                sitemap.pages.find(
                  (p) =>
                    (p.slug === "/" ? "home" : p.slug.replace(/^\//, "")) === selectedPageSlug
                )?.name || "Page"
              }
              activeSectionId={editingSection?.id || null}
              onSectionClick={(section) => setEditingSection(section)}
              styleColors={style?.colors}
              draggedIndex={draggedIndex}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onAddSection={(atIndex) => {
                setInsertAtIndex(atIndex);
                setIsAddingSection(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating Zoom Controls - fixed position */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-1 bg-background/90 backdrop-blur border rounded-lg p-1 shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={zoomOut}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              disabled={zoom <= ZOOM_LEVELS[0]}
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>

        <button
          onClick={resetZoom}
          className="px-2 py-1 text-xs font-medium min-w-[50px] hover:bg-muted rounded transition-colors"
        >
          {Math.round(zoom * 100)}%
        </button>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={zoomIn}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>

        <div className="w-px h-4 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={resetZoom}
              className="p-1.5 rounded hover:bg-muted transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Reset zoom</TooltipContent>
        </Tooltip>
      </div>

      {/* Floating Section Editor Panel */}
      {editingSection && (
        <FloatingSectionEditor
          section={editingSection}
          onUpdate={(updates) => updateSection(editingSection.id, updates)}
          onClose={() => setEditingSection(null)}
          onDelete={() => deleteSection(editingSection.id)}
        />
      )}

      {/* Add Section Dialog */}
      <Dialog open={isAddingSection} onOpenChange={(open) => {
        setIsAddingSection(open);
        if (!open) {
          setSelectedSectionType(null);
          setInsertAtIndex(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedSectionType
                ? `Choose ${SECTION_TYPES[selectedSectionType]?.name} Layout`
                : "Add a Section"}
            </DialogTitle>
          </DialogHeader>

          {selectedSectionType ? (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSectionType(null)}
                className="text-muted-foreground"
              >
                ← Back to section types
              </Button>
              <LayoutTemplatePicker
                sectionType={selectedSectionType}
                onBack={() => setSelectedSectionType(null)}
                onSelect={(templateId, variantId) => {
                  addSection(selectedSectionType, variantId, templateId, insertAtIndex ?? undefined);
                }}
              />
            </div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-4 gap-3 pr-4">
                {SECTION_TYPES_WITH_TEMPLATES.map((type) => {
                  const sectionType = SECTION_TYPES[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedSectionType(type)}
                      className="p-3 border rounded-lg hover:border-primary hover:bg-primary/5 text-left transition-all group"
                    >
                      {/* Wireframe Preview */}
                      <div className="mb-2 p-2 bg-muted/50 rounded border h-14 overflow-hidden">
                        <SectionTypeWireframe type={type} />
                      </div>
                      <div className="font-medium text-xs">{sectionType.name}</div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Floating section editor panel
function FloatingSectionEditor({
  section,
  onUpdate,
  onClose,
  onDelete,
}: {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const isCustomSection = section.type === 'custom';
  const sectionType = !isCustomSection ? SECTION_TYPES[section.type as keyof typeof SECTION_TYPES] : null;
  const { templates, isLoading: templatesLoading } = useWireframeTemplates(isCustomSection ? null : section.type as SectionType);

  const currentTemplate = templates.find(t => t.id === section.layoutTemplateId);
  const displayName = currentTemplate?.name || section.layoutVariant;
  const hasWireframeTemplates = templates.length > 0;

  return (
    <div className="fixed right-6 top-[140px] bottom-6 w-[400px] bg-background border rounded-xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-muted/30">
        <div>
          <div className="font-medium">
            {isCustomSection ? (section.customType || 'Custom Section') : (sectionType?.name || section.type)}
          </div>
          <div className="text-sm text-muted-foreground">
            {isCustomSection ? 'Custom section type' : displayName}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content - use overflow-y-auto with min-h-0 to enable scrolling */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Layout Template Selector */}
          {hasWireframeTemplates && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Layout Template</Label>

              {templatesLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-28 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onUpdate({
                        layoutTemplateId: template.id,
                        layoutVariant: template.id
                      })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onUpdate({
                            layoutTemplateId: template.id,
                            layoutVariant: template.id
                          });
                        }
                      }}
                      className={cn(
                        "p-2 border-2 rounded-lg text-left transition-all cursor-pointer",
                        section.layoutTemplateId === template.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      )}
                    >
                      <div className="mb-2 h-20 overflow-hidden rounded bg-neutral-100">
                        <div className="origin-top-left scale-[0.2] w-[500%]">
                          <WireframePreview template={template} />
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        {section.layoutTemplateId === template.id && (
                          <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs">{template.name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Layout Template Picker for the Add Section dialog
function LayoutTemplatePicker({
  sectionType,
  onBack,
  onSelect,
}: {
  sectionType: SectionType;
  onBack: () => void;
  onSelect: (templateId: string, variantId: string) => void;
}) {
  const { templates, isLoading } = useWireframeTemplates(sectionType);
  const sectionTypeInfo = SECTION_TYPES[sectionType];
  const hasWireframeTemplates = templates.length > 0;

  return (
    <div>
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : hasWireframeTemplates ? (
        <ScrollArea className="h-[55vh]">
          <div className="grid grid-cols-3 gap-4 pr-4">
            {templates.map((template) => (
              <div
                key={template.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(template.id, template.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(template.id, template.id);
                  }
                }}
                className="p-3 border-2 rounded-lg hover:border-primary hover:bg-primary/5 text-left transition-all group cursor-pointer"
              >
                {/* Wireframe Preview - scaled down */}
                <div className="mb-3 h-24 overflow-hidden rounded bg-neutral-100">
                  <div className="origin-top-left scale-[0.25] w-[400%]">
                    <WireframePreview template={template} />
                  </div>
                </div>
                <div className="font-medium text-xs">{template.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  {template.description}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-2">
            Layout templates for {sectionTypeInfo?.name} coming soon
          </div>
          <p className="text-xs text-muted-foreground">
            This section type doesn&apos;t have wireframe templates yet.
          </p>
        </div>
      )}
    </div>
  );
}

// Canvas Preview component - full page wireframe preview
function CanvasPreview({
  sections,
  pageName,
  activeSectionId,
  onSectionClick,
  styleColors,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
  onAddSection,
}: {
  sections: Section[];
  pageName: string;
  activeSectionId: string | null;
  onSectionClick?: (section: Section) => void;
  styleColors?: StyleColors;
  draggedIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onAddSection: (atIndex: number) => void;
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
          {/* Add Section at Top */}
          <AddSectionButton onClick={() => onAddSection(0)} isFirst />

          {sections.map((section, index) => (
            <React.Fragment key={section.id}>
              <div
                ref={(el) => { sectionRefs.current[section.id] = el; }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  // Hide the default browser drag ghost by using a transparent image
                  const transparentImg = new Image();
                  transparentImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                  e.dataTransfer.setDragImage(transparentImg, 0, 0);
                  onDragStart(index);
                }}
                onDragOver={(e) => onDragOver(e, index)}
                onDragEnd={onDragEnd}
              >
                <CanvasSectionCard
                  section={section}
                  index={index}
                  isActive={section.id === activeSectionId}
                  isDragging={draggedIndex === index}
                  onClick={onSectionClick ? () => onSectionClick(section) : undefined}
                />
              </div>

              {/* Add Section Button Between Sections (bigger at bottom) */}
              <AddSectionButton
                onClick={() => onAddSection(index + 1)}
                isLast={index === sections.length - 1}
              />
            </React.Fragment>
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
              <button
                onClick={() => onAddSection(0)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add your first section
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add section button shown between sections
function AddSectionButton({ onClick, isFirst = false, isLast = false }: { onClick: () => void; isFirst?: boolean; isLast?: boolean }) {
  return (
    <div className={cn(
      "group flex items-center justify-center",
      isFirst ? "h-2" : isLast ? "h-12 mt-4" : "h-4"
    )}>
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-1.5 rounded-full transition-all duration-200",
          "border shadow-sm hover:shadow-md",
          isLast
            ? "px-5 py-2.5 text-sm bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-primary/30 hover:border-primary opacity-100"
            : "px-3 py-1 text-xs bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary opacity-0 group-hover:opacity-100"
        )}
      >
        <Plus className={isLast ? "h-4 w-4" : "h-3 w-3"} />
        <span>Add Section</span>
      </button>
    </div>
  );
}

// Canvas section card that uses wireframe templates when available
function CanvasSectionCard({
  section,
  isActive = false,
  isDragging = false,
  onClick,
}: {
  section: Section;
  index: number;
  isActive?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
}) {
  const { templates } = useWireframeTemplates(section.type as SectionType);

  // Find the selected template if one exists
  const selectedTemplate = templates.find(t => t.id === section.layoutTemplateId);

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg group relative",
        onClick && "cursor-pointer",
        // Smooth transitions when not dragging
        !isDragging && "transition-all duration-200",
        // Dragging state: lift up with shadow, scale slightly, rotate for visual effect
        isDragging
          ? "scale-[1.02] shadow-2xl ring-2 ring-primary z-50 rotate-[1deg] opacity-95"
          : isActive
          ? "ring-[3px] ring-primary"
          : "hover:ring-[3px] hover:ring-primary/60"
      )}
    >
      {/* Wireframe representation - clean like Relume */}
      <div className="rounded-lg overflow-hidden bg-neutral-100">
        {selectedTemplate ? (
          <WireframePreview
            template={selectedTemplate}
            compact={false}
            className="min-h-[420px]"
          />
        ) : (
          <div className="min-h-[420px] flex items-center justify-center p-8 bg-neutral-100">
            <DefaultSectionWireframe type={section.type} />
          </div>
        )}
      </div>

      {/* Drag handle - shows on hover */}
      <div className={cn(
        "absolute -left-4 top-1/2 -translate-y-1/2 p-1 rounded bg-background/80 shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity",
        isDragging && "opacity-100 bg-primary/10 border-primary"
      )}>
        <GripVertical className={cn(
          "h-4 w-4 cursor-grab text-neutral-400",
          isDragging && "cursor-grabbing text-primary"
        )} />
      </div>
    </div>
  );
}

// Default wireframe for sections without template support - Relume style with actual text
function DefaultSectionWireframe({ type }: { type: string }) {
  if (type === "hero") {
    return (
      <div className="space-y-4 max-w-lg">
        <p className="font-bold text-neutral-800 text-xl leading-tight">
          Medium length hero heading goes here
        </p>
        <p className="text-neutral-500 text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.
        </p>
        <div className="flex gap-3 pt-2">
          <button className="bg-neutral-900 text-white font-medium rounded px-4 py-2 text-xs">Button</button>
          <button className="bg-white text-neutral-900 font-medium rounded border border-neutral-300 px-4 py-2 text-xs">Button</button>
        </div>
      </div>
    );
  }
  if (type === "features") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <p className="font-bold text-neutral-800 text-lg">Features section heading</p>
          <p className="text-neutral-500 text-xs">Lorem ipsum dolor sit amet</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="bg-neutral-300 rounded-md mx-auto w-10 h-10" />
              <p className="font-semibold text-neutral-800 text-sm">Feature</p>
              <p className="text-neutral-500 text-xs">Lorem ipsum dolor sit amet</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type === "testimonials") {
    return (
      <div className="space-y-6">
        <p className="font-bold text-neutral-800 text-lg text-center">Testimonials</p>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-neutral-200 p-4 space-y-3">
              <p className="text-neutral-600 text-xs">"Lorem ipsum dolor sit amet"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-300" />
                <div>
                  <p className="text-neutral-800 text-xs font-medium">Name</p>
                  <p className="text-neutral-500 text-[10px]">Role</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type === "cta") {
    return (
      <div className="text-center space-y-4">
        <p className="font-bold text-neutral-800 text-lg">Call to action heading</p>
        <p className="text-neutral-500 text-sm">Lorem ipsum dolor sit amet</p>
        <button className="bg-neutral-900 text-white font-medium rounded px-5 py-2.5 text-sm">Button</button>
      </div>
    );
  }
  // Default fallback
  return (
    <div className="space-y-3 max-w-md">
      <p className="font-bold text-neutral-800 text-lg">Section heading</p>
      <p className="text-neutral-500 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  );
}

// Wireframe preview for section types (shown in the category picker)
function SectionTypeWireframe({ type }: { type: SectionType }) {
  const wireframes: Record<SectionType, React.ReactNode> = {
    hero: (
      <div className="flex gap-2 items-center h-full">
        <div className="flex-1 space-y-1">
          <div className="h-2 bg-muted-foreground/40 rounded w-3/4" />
          <div className="h-1.5 bg-muted-foreground/20 rounded w-1/2" />
          <div className="h-3 w-8 bg-primary/40 rounded mt-1" />
        </div>
        <div className="w-10 h-8 bg-muted-foreground/20 rounded flex items-center justify-center">
          <ImageIcon className="h-3 w-3 text-muted-foreground/40" />
        </div>
      </div>
    ),
    logos: (
      <div className="flex items-center justify-center gap-2 h-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-6 h-4 bg-muted-foreground/20 rounded" />
        ))}
      </div>
    ),
    features: (
      <div className="grid grid-cols-3 gap-1 h-full items-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-0.5">
            <div className="w-3 h-3 bg-primary/30 rounded" />
            <div className="h-1 bg-muted-foreground/30 rounded w-full" />
            <div className="h-0.5 bg-muted-foreground/20 rounded w-3/4" />
          </div>
        ))}
      </div>
    ),
    'how-it-works': (
      <div className="flex items-center justify-center gap-1 h-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-0.5">
            <div className="w-4 h-4 rounded-full bg-primary/30 flex items-center justify-center text-[6px] font-bold text-primary/60">
              {i}
            </div>
            {i < 3 && <div className="w-3 h-0.5 bg-muted-foreground/30" />}
          </div>
        ))}
      </div>
    ),
    testimonials: (
      <div className="grid grid-cols-3 gap-1 h-full items-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-1 bg-background rounded border space-y-0.5">
            <div className="h-0.5 bg-muted-foreground/30 rounded w-full" />
            <div className="h-0.5 bg-muted-foreground/20 rounded w-3/4" />
            <div className="flex items-center gap-0.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <div className="h-0.5 bg-muted-foreground/20 rounded w-3" />
            </div>
          </div>
        ))}
      </div>
    ),
    pricing: (
      <div className="grid grid-cols-3 gap-1 h-full items-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className={cn("p-1 rounded border space-y-0.5", i === 2 && "border-primary/50 bg-primary/5")}>
            <div className="h-1 bg-muted-foreground/30 rounded w-1/2" />
            <div className="h-1.5 bg-muted-foreground/40 rounded w-2/3" />
            <div className="h-2 bg-primary/30 rounded w-full mt-0.5" />
          </div>
        ))}
      </div>
    ),
    faq: (
      <div className="space-y-1 h-full flex flex-col justify-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-muted-foreground/30 flex items-center justify-center text-[4px]">+</div>
            <div className="h-1 bg-muted-foreground/30 rounded flex-1" />
          </div>
        ))}
      </div>
    ),
    cta: (
      <div className="flex flex-col items-center justify-center h-full gap-1">
        <div className="h-1.5 bg-muted-foreground/40 rounded w-1/2" />
        <div className="h-1 bg-muted-foreground/20 rounded w-1/3" />
        <div className="h-3 w-10 bg-primary/40 rounded mt-0.5" />
      </div>
    ),
    team: (
      <div className="grid grid-cols-4 gap-1 h-full items-center">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
            <div className="h-0.5 bg-muted-foreground/20 rounded w-full" />
          </div>
        ))}
      </div>
    ),
    stats: (
      <div className="grid grid-cols-4 gap-1 h-full items-center">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center">
            <div className="h-2 bg-primary/40 rounded w-3/4 mx-auto" />
            <div className="h-0.5 bg-muted-foreground/20 rounded w-full mt-0.5" />
          </div>
        ))}
      </div>
    ),
    contact: (
      <div className="flex gap-2 h-full items-center">
        <div className="flex-1 space-y-0.5">
          <div className="h-1 bg-muted-foreground/30 rounded w-3/4" />
          <div className="h-2 bg-muted-foreground/20 rounded w-full" />
          <div className="h-2 bg-muted-foreground/20 rounded w-full" />
          <div className="h-2.5 bg-primary/40 rounded w-1/3 mt-0.5" />
        </div>
      </div>
    ),
    content: (
      <div className="grid grid-cols-3 gap-1 h-full items-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded overflow-hidden">
            <div className="h-4 bg-muted-foreground/20" />
            <div className="p-0.5 space-y-0.5">
              <div className="h-0.5 bg-muted-foreground/30 rounded w-3/4" />
              <div className="h-0.5 bg-muted-foreground/20 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    ),
  };

  return wireframes[type] || null;
}
