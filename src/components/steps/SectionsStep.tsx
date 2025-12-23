"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { OnboardingShell } from "@/components/layout/OnboardingShell";
import { useLandfall } from "@/lib/context";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Trash2,
  GripVertical,
  Layers,
  FileText,
  ChevronRight,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Section, SECTION_TYPES, SectionType, SectionInspiration, StyleColors } from "@/lib/types";
import { useWireframeTemplates } from "@/hooks/useWireframeTemplates";
import { WireframePreview } from "@/components/wireframe/WireframePreview";
import { InspirationUploader, Inspiration } from "@/components/shared/InspirationUploader";

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

export default function SectionsStep() {
  const { sitemap, pages, updatePage, style } = useLandfall();
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>("home");
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState<SectionType | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

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

  const addSection = (type: SectionType, variant: string, templateId?: string) => {
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
    updatePage(selectedPageSlug, {
      sections: [...(currentPage?.sections || []), newSection],
    });
    setIsAddingSection(false);
    setSelectedSectionType(null);
    // Don't auto-open editor - let user see the section was added to the list
    // They can click on it if they want to edit
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

  if (!sitemap) return null;

  return (
    <OnboardingShell
      stepIndex={4}
      title="Build your sections"
      description="Add and configure sections for each page. Define what each section should contain."
      preview={
        <SectionsPreview
          sections={currentPage?.sections || []}
          pageName={
            sitemap.pages.find(
              (p) =>
                (p.slug === "/" ? "home" : p.slug.replace(/^\//, "")) === selectedPageSlug
            )?.name || "Page"
          }
          activeSectionId={editingSection?.id || null}
          onSectionClick={(section) => setEditingSection(section)}
          styleColors={style?.colors}
        />
      }
    >
      {/* Page Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sitemap.pages.map((page) => {
          const pageSlug = page.slug === "/" ? "home" : page.slug.replace(/^\//, "");
          return (
            <button
              key={page.id}
              onClick={() => {
                setSelectedPageSlug(pageSlug);
                setEditingSection(null);
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
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

      {/* Section List or Editor */}
      {editingSection ? (
        <SectionEditor
          section={editingSection}
          onUpdate={(updates) => updateSection(editingSection.id, updates)}
          onClose={() => setEditingSection(null)}
          onDelete={() => deleteSection(editingSection.id)}
        />
      ) : (
        <div className="space-y-3">
          {displaySections.map((section, index) => {
            const sectionType = SECTION_TYPES[section.type as keyof typeof SECTION_TYPES];
            const variant = sectionType?.variants.find(
              (v) => v.id === section.layoutVariant
            );
            const isDragging = draggedIndex === index;
            return (
              <div
                key={section.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  handleDragStart(index);
                }}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setEditingSection(section)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 border rounded-xl text-left cursor-pointer",
                  "transition-transform duration-150 ease-out",
                  isDragging
                    ? "opacity-70 scale-[0.98] shadow-lg border-primary bg-primary/5 z-10"
                    : "hover:border-primary/50"
                )}
                style={{
                  // Add smooth transition for reordering
                  transform: isDragging ? 'scale(0.98)' : 'scale(1)',
                }}
              >
                <GripVertical className={cn(
                  "h-4 w-4 text-muted-foreground flex-shrink-0 transition-colors",
                  isDragging ? "cursor-grabbing text-primary" : "cursor-grab"
                )} />
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{sectionType?.name || section.type}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {variant?.name || section.layoutVariant}
                  </div>
                </div>
                <Badge variant="outline" className="flex-shrink-0">
                  {index + 1}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            );
          })}

          {/* Add Section Button */}
          <Dialog open={isAddingSection} onOpenChange={(open) => {
            setIsAddingSection(open);
            if (!open) setSelectedSectionType(null);
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
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
                      addSection(selectedSectionType, variantId, templateId);
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

          {(!currentPage?.sections || currentPage.sections.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No sections yet. Add your first section to get started.
            </div>
          )}
        </div>
      )}
    </OnboardingShell>
  );
}

function SectionEditor({
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

  // Find the current template
  const currentTemplate = templates.find(t => t.id === section.layoutTemplateId);
  const displayName = currentTemplate?.name || section.layoutVariant;

  // Check if this section type has wireframe templates available
  const hasWireframeTemplates = templates.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>
          ← Back to sections
        </Button>
        <Button variant="ghost" onClick={onDelete} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <div className="p-4 bg-muted/50 rounded-xl">
        <div className="font-medium">
          {isCustomSection ? (section.customType || 'Custom Section') : (sectionType?.name || section.type)}
        </div>
        <div className="text-sm text-muted-foreground">
          {isCustomSection ? 'Custom section type' : displayName}
        </div>
      </div>

      {/* Layout Template Selector - New wireframe-based picker */}
      {hasWireframeTemplates && (
        <div className="space-y-3">
          <Label className="text-base font-medium">Layout Template</Label>

          {templatesLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onUpdate({
                    layoutTemplateId: template.id,
                    layoutVariant: template.id
                  })}
                  className={cn(
                    "p-3 border-2 rounded-xl text-left transition-all",
                    section.layoutTemplateId === template.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  {/* Wireframe Preview */}
                  <div className="mb-3 h-32 overflow-hidden">
                    <WireframePreview template={template} compact className="h-full" />
                  </div>

                  {/* Template info */}
                  <div className="flex items-start gap-2">
                    {section.layoutTemplateId === template.id && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {template.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inspirations - moved above Copy Instructions */}
      <InspirationUploader
        inspirations={section.inspirations as Inspiration[]}
        onUpdate={(inspirations) => onUpdate({ inspirations: inspirations as SectionInspiration[] })}
        title="Inspirations"
        description="Add screenshots or URLs of section designs you like. Include notes about what appeals to you."
        uploadCategory="section-inspirations"
      />

      {/* Copy Instructions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base font-medium">Copy Instructions</Label>
        </div>
        <Textarea
          value={section.copyInstructions}
          onChange={(e) => onUpdate({ copyInstructions: e.target.value })}
          placeholder="Describe what the text content should communicate. Be specific about headlines, body copy, CTAs, etc."
          className="min-h-[120px]"
        />
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
              <button
                key={template.id}
                onClick={() => onSelect(template.id, template.id)}
                className="p-3 border-2 rounded-lg hover:border-primary hover:bg-primary/5 text-left transition-all group"
              >
                {/* Wireframe Preview */}
                <div className="mb-3 h-32 overflow-hidden">
                  <WireframePreview template={template} compact className="h-full" />
                </div>
                <div className="font-medium text-xs">{template.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  {template.description}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        /* No templates available yet for this section type */
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

function SectionsPreview({
  sections,
  pageName,
  activeSectionId,
  onSectionClick,
  styleColors,
}: {
  sections: Section[];
  pageName: string;
  activeSectionId: string | null;
  onSectionClick?: (section: Section) => void;
  styleColors?: StyleColors;
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
    <div className="w-full max-w-2xl h-full flex flex-col">
      <div
        className="rounded-xl shadow-2xl overflow-hidden border flex-1 flex flex-col min-h-0"
        style={{
          backgroundColor: styleColors?.background || 'white',
          borderColor: styleColors?.border || undefined,
          ...styleVars,
        }}
      >
        <div
          className="px-4 py-2.5 flex items-center gap-2 border-b flex-shrink-0"
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
            <div
              className="rounded-md px-3 py-1 text-xs"
              style={{
                backgroundColor: styleColors?.background || undefined,
                color: styleColors?.textMuted || undefined,
              }}
            >
              {pageName}
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {sections.map((section, index) => (
              <div
                key={section.id}
                ref={(el) => { sectionRefs.current[section.id] = el; }}
              >
                <SectionPreviewCard
                  section={section}
                  index={index}
                  isActive={section.id === activeSectionId}
                  onClick={onSectionClick ? () => onSectionClick(section) : undefined}
                  styleColors={styleColors}
                />
              </div>
            ))}

            {sections.length === 0 && (
              <div
                className="text-center py-12"
                style={{ color: styleColors?.textMuted || undefined }}
              >
                Add sections to see the wireframe preview
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Individual section preview card that uses wireframe templates when available
function SectionPreviewCard({
  section,
  index,
  isActive = false,
  onClick,
  styleColors,
}: {
  section: Section;
  index: number;
  isActive?: boolean;
  onClick?: () => void;
  styleColors?: StyleColors;
}) {
  const sectionType = SECTION_TYPES[section.type as keyof typeof SECTION_TYPES];
  const { templates } = useWireframeTemplates(section.type as SectionType);

  // Find the selected template if one exists
  const selectedTemplate = templates.find(t => t.id === section.layoutTemplateId);

  return (
    <div
      onClick={onClick}
      className={cn(
        "border rounded-lg p-3 transition-all",
        onClick && "cursor-pointer hover:shadow-md",
        isActive
          ? "border-2 shadow-md ring-2"
          : "hover:shadow-sm"
      )}
      style={{
        backgroundColor: styleColors?.backgroundAlt || (isActive ? undefined : 'rgba(255,255,255,0.5)'),
        borderColor: isActive ? styleColors?.primary : (styleColors?.border || 'rgba(0,0,0,0.1)'),
        borderStyle: isActive ? 'solid' : 'solid',
        ...(isActive && styleColors?.primary ? {
          boxShadow: `0 4px 6px -1px ${styleColors.primary}20`,
          outline: `2px solid ${styleColors.primary}30`,
          outlineOffset: '1px',
        } : {}),
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5"
          style={{
            borderColor: styleColors?.primary || undefined,
            color: styleColors?.primary || undefined,
          }}
        >
          {index + 1}
        </Badge>
        <span
          className="font-medium text-xs"
          style={{ color: styleColors?.text || undefined }}
        >
          {section.type === 'custom' ? (section.customType || 'Custom') : (sectionType?.name || section.type)}
        </span>
        {selectedTemplate && (
          <span
            className="text-[10px]"
            style={{ color: styleColors?.textMuted || undefined }}
          >
            · {selectedTemplate.name}
          </span>
        )}
      </div>

      {/* Wireframe representation - use template preview if available */}
      <div
        className="rounded overflow-hidden"
        style={{
          backgroundColor: styleColors?.background || 'rgba(0,0,0,0.03)',
        }}
      >
        {selectedTemplate ? (
          <WireframePreview
            template={selectedTemplate}
            compact
            className="min-h-[200px]"
            styleColors={styleColors}
          />
        ) : (
          <div
            className="min-h-[180px] flex items-center justify-center p-4"
            style={{ backgroundColor: styleColors?.backgroundAlt || undefined }}
          >
            <DefaultSectionWireframe type={section.type} styleColors={styleColors} />
          </div>
        )}
      </div>

      {(section.copyInstructions || section.inspirations?.length > 0) && (
        <div
          className="mt-2 text-[10px] flex gap-3"
          style={{ color: styleColors?.textMuted || undefined }}
        >
          {section.copyInstructions && (
            <div className="truncate flex-1">📝 {section.copyInstructions}</div>
          )}
          {section.inspirations?.length > 0 && (
            <div className="flex-shrink-0">🖼️ {section.inspirations.length}</div>
          )}
        </div>
      )}
    </div>
  );
}

// Default wireframe for sections without template support
function DefaultSectionWireframe({ type, styleColors }: { type: string; styleColors?: StyleColors }) {
  const primaryBg = styleColors?.primary ? `${styleColors.primary}30` : undefined;
  const mutedBg = styleColors?.textMuted ? `${styleColors.textMuted}30` : undefined;
  const mutedBgLight = styleColors?.textMuted ? `${styleColors.textMuted}20` : undefined;

  if (type === "hero") {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" style={{ backgroundColor: mutedBg }} />
        <div className="h-3 bg-muted/60 rounded w-1/2" style={{ backgroundColor: mutedBgLight }} />
        <div className="flex gap-2 mt-4">
          <div className="h-8 w-24 bg-primary/20 rounded" style={{ backgroundColor: primaryBg }} />
          <div className="h-8 w-24 bg-muted rounded" style={{ backgroundColor: mutedBg }} />
        </div>
      </div>
    );
  }
  if (type === "features") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-8 w-8 bg-muted rounded" style={{ backgroundColor: primaryBg }} />
            <div className="h-2 bg-muted rounded w-3/4" style={{ backgroundColor: mutedBg }} />
            <div className="h-2 bg-muted/60 rounded w-1/2" style={{ backgroundColor: mutedBgLight }} />
          </div>
        ))}
      </div>
    );
  }
  if (type === "testimonials") {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 p-2 bg-background rounded"
            style={{ backgroundColor: styleColors?.background }}
          >
            <div className="h-2 bg-muted rounded w-full mb-1" style={{ backgroundColor: mutedBg }} />
            <div className="h-2 bg-muted/60 rounded w-3/4" style={{ backgroundColor: mutedBgLight }} />
            <div className="flex items-center gap-1 mt-2">
              <div className="h-4 w-4 bg-muted rounded-full" style={{ backgroundColor: mutedBg }} />
              <div className="h-2 bg-muted rounded w-12" style={{ backgroundColor: mutedBg }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (type === "cta") {
    return (
      <div className="text-center space-y-2">
        <div className="h-4 bg-muted rounded w-1/2 mx-auto" style={{ backgroundColor: mutedBg }} />
        <div className="h-3 bg-muted/60 rounded w-1/3 mx-auto" style={{ backgroundColor: mutedBgLight }} />
        <div className="h-8 w-28 bg-primary/20 rounded mx-auto mt-3" style={{ backgroundColor: primaryBg }} />
      </div>
    );
  }
  // Default fallback
  return (
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded w-1/2" style={{ backgroundColor: mutedBg }} />
      <div className="h-3 bg-muted/60 rounded w-3/4" style={{ backgroundColor: mutedBgLight }} />
      <div className="h-3 bg-muted/60 rounded w-2/3" style={{ backgroundColor: mutedBgLight }} />
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
