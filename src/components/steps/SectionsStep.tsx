"use client";

import React, { useState, useRef } from "react";
import { OnboardingShell } from "@/components/layout/OnboardingShell";
import { useLandfall } from "@/lib/context";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Section, SECTION_TYPES, SectionType, LayoutTemplate, SectionInspiration } from "@/lib/types";
import { useWireframeTemplates } from "@/hooks/useWireframeTemplates";
import { WireframePreview } from "@/components/wireframe/WireframePreview";
import { InspirationUploader, Inspiration } from "@/components/shared/InspirationUploader";

// Section types that have wireframe templates available
const SECTION_TYPES_WITH_TEMPLATES: SectionType[] = ['features'];

export default function SectionsStep() {
  const { sitemap, pages, updatePage, refreshData } = useLandfall();
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>("home");
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState<SectionType | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const currentPage = pages[selectedPageSlug];

  const generateId = () => `section_${Date.now()}`;

  const addSection = (type: SectionType, variant: string, templateId?: string) => {
    if (currentPage) {
      const newSection: Section = {
        id: generateId(),
        type,
        layoutVariant: variant,
        layoutTemplateId: templateId,
        order: (currentPage.sections?.length || 0) + 1,
        copyInstructions: "",
        visualInstructions: "",
        inspirations: [],
      };
      updatePage(selectedPageSlug, {
        sections: [...(currentPage.sections || []), newSection],
      });
      setIsAddingSection(false);
      setSelectedSectionType(null);
      setEditingSection(newSection);
    }
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

  const reorderSections = (fromIndex: number, toIndex: number) => {
    if (currentPage && fromIndex !== toIndex) {
      const sections = [...currentPage.sections];
      const [removed] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, removed);
      const reorderedSections = sections.map((s, i) => ({ ...s, order: i + 1 }));
      updatePage(selectedPageSlug, { sections: reorderedSections });
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderSections(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
          {(currentPage?.sections || []).map((section, index) => {
            const sectionType = SECTION_TYPES[section.type as keyof typeof SECTION_TYPES];
            const variant = sectionType?.variants.find(
              (v) => v.id === section.layoutVariant
            );
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            return (
              <div
                key={section.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setEditingSection(section)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 border rounded-xl transition-all text-left cursor-pointer",
                  isDragging && "opacity-50 scale-95",
                  isDragOver && "border-primary border-2 bg-primary/5",
                  !isDragging && !isDragOver && "hover:border-primary/50"
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
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
          <Dialog open={isAddingSection} onOpenChange={setIsAddingSection}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>
                  {selectedSectionType
                    ? `Select ${SECTION_TYPES[selectedSectionType]?.name} Layout`
                    : "Add Section"}
                </DialogTitle>
              </DialogHeader>

              {selectedSectionType ? (
                <LayoutTemplatePicker
                  sectionType={selectedSectionType}
                  onBack={() => setSelectedSectionType(null)}
                  onSelect={(templateId, variantId) => {
                    addSection(selectedSectionType, variantId, templateId);
                  }}
                />
              ) : (
                <ScrollArea className="h-[500px] pt-4">
                  <div className="grid grid-cols-3 gap-4 pr-4">
                    {SECTION_TYPES_WITH_TEMPLATES.map((type) => {
                      const sectionType = SECTION_TYPES[type];
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedSectionType(type)}
                          className="p-4 border rounded-xl hover:border-primary hover:bg-primary/5 text-left transition-all group"
                        >
                          {/* Wireframe Preview */}
                          <div className="mb-3 p-2 bg-muted/50 rounded-lg border h-16 overflow-hidden">
                            <SectionTypeWireframe type={type} />
                          </div>
                          <div className="font-medium text-sm">{sectionType.name}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {sectionType.description}
                          </div>
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
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
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
                  <div className="mb-3 h-24 overflow-hidden">
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
    <div className="space-y-4 pt-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-2"
      >
        ← Back to section types
      </Button>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 pr-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : hasWireframeTemplates ? (
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-2 gap-4 pr-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template.id, template.id)}
                className="p-4 border-2 rounded-xl hover:border-primary hover:bg-primary/5 text-left transition-all group"
              >
                {/* Wireframe Preview */}
                <div className="mb-3 h-28 overflow-hidden">
                  <WireframePreview template={template} className="h-full" />
                </div>
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
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
}: {
  sections: Section[];
  pageName: string;
}) {
  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border">
        <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-background rounded-md px-4 py-1.5 text-xs text-muted-foreground">
              {pageName}
            </div>
          </div>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-4">
            {sections.map((section, index) => (
              <SectionPreviewCard key={section.id} section={section} index={index} />
            ))}

            {sections.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
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
function SectionPreviewCard({ section, index }: { section: Section; index: number }) {
  const sectionType = SECTION_TYPES[section.type as keyof typeof SECTION_TYPES];
  const { templates } = useWireframeTemplates(section.type as SectionType);

  // Find the selected template if one exists
  const selectedTemplate = templates.find(t => t.id === section.layoutTemplateId);

  return (
    <div className="border-2 border-dashed border-muted rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-xs">
          {index + 1}
        </Badge>
        <span className="font-medium text-sm">
          {section.type === 'custom' ? (section.customType || 'Custom') : (sectionType?.name || section.type)}
        </span>
        {selectedTemplate && (
          <span className="text-xs text-muted-foreground">
            - {selectedTemplate.name}
          </span>
        )}
      </div>

      {/* Wireframe representation - use template preview if available */}
      <div className="bg-muted/30 rounded p-4">
        {selectedTemplate ? (
          <WireframePreview template={selectedTemplate} className="min-h-[280px]" />
        ) : (
          <div className="min-h-[280px] flex items-center justify-center">
            <DefaultSectionWireframe type={section.type} />
          </div>
        )}
      </div>

      {(section.copyInstructions || section.inspirations?.length > 0) && (
        <div className="mt-2 text-xs text-muted-foreground">
          {section.copyInstructions && (
            <div className="truncate">📝 {section.copyInstructions}</div>
          )}
          {section.inspirations?.length > 0 && (
            <div className="truncate">🖼️ {section.inspirations.length} inspiration{section.inspirations.length !== 1 ? 's' : ''}</div>
          )}
        </div>
      )}
    </div>
  );
}

// Default wireframe for sections without template support
function DefaultSectionWireframe({ type }: { type: string }) {
  if (type === "hero") {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted/60 rounded w-1/2" />
        <div className="flex gap-2 mt-4">
          <div className="h-8 w-24 bg-primary/20 rounded" />
          <div className="h-8 w-24 bg-muted rounded" />
        </div>
      </div>
    );
  }
  if (type === "features") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-8 w-8 bg-muted rounded" />
            <div className="h-2 bg-muted rounded w-3/4" />
            <div className="h-2 bg-muted/60 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  if (type === "testimonials") {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 p-2 bg-background rounded">
            <div className="h-2 bg-muted rounded w-full mb-1" />
            <div className="h-2 bg-muted/60 rounded w-3/4" />
            <div className="flex items-center gap-1 mt-2">
              <div className="h-4 w-4 bg-muted rounded-full" />
              <div className="h-2 bg-muted rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (type === "cta") {
    return (
      <div className="text-center space-y-2">
        <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
        <div className="h-3 bg-muted/60 rounded w-1/3 mx-auto" />
        <div className="h-8 w-28 bg-primary/20 rounded mx-auto mt-3" />
      </div>
    );
  }
  // Default fallback
  return (
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-3 bg-muted/60 rounded w-3/4" />
      <div className="h-3 bg-muted/60 rounded w-2/3" />
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

// Wireframe preview for specific layout variants
function VariantWireframe({ type, variantId }: { type: SectionType; variantId: string }) {
  // Hero variants
  if (type === 'hero') {
    if (variantId === 'hero-centered') {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-1">
          <div className="h-2.5 bg-muted-foreground/40 rounded w-1/2" />
          <div className="h-1.5 bg-muted-foreground/20 rounded w-1/3" />
          <div className="flex gap-1 mt-1">
            <div className="h-3 w-10 bg-primary/40 rounded" />
            <div className="h-3 w-10 bg-muted-foreground/20 rounded" />
          </div>
        </div>
      );
    }
    if (variantId === 'hero-centered-image-right' || variantId === 'hero-split-50-50') {
      return (
        <div className="flex gap-2 items-center h-full">
          <div className="flex-1 space-y-1">
            <div className="h-2 bg-muted-foreground/40 rounded w-3/4" />
            <div className="h-1.5 bg-muted-foreground/20 rounded w-full" />
            <div className="h-3 w-12 bg-primary/40 rounded mt-1" />
          </div>
          <div className="w-1/2 h-full bg-muted-foreground/20 rounded flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
          </div>
        </div>
      );
    }
    if (variantId === 'hero-fullwidth-bg' || variantId === 'hero-video-bg') {
      return (
        <div className="relative h-full bg-muted-foreground/20 rounded flex flex-col items-center justify-center">
          <ImageIcon className="absolute right-1 top-1 h-2 w-2 text-muted-foreground/30" />
          <div className="h-2 bg-white/80 rounded w-1/2 mb-1" />
          <div className="h-1.5 bg-white/60 rounded w-1/3" />
          <div className="h-3 w-10 bg-primary/60 rounded mt-1" />
        </div>
      );
    }
  }

  // Features variants
  if (type === 'features') {
    if (variantId === 'features-three-column-cards') {
      return (
        <div className="grid grid-cols-3 gap-2 h-full items-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-1 border rounded space-y-1">
              <div className="w-4 h-4 bg-primary/30 rounded" />
              <div className="h-1.5 bg-muted-foreground/40 rounded w-3/4" />
              <div className="h-1 bg-muted-foreground/20 rounded w-full" />
            </div>
          ))}
        </div>
      );
    }
    if (variantId === 'features-two-column-cards') {
      return (
        <div className="grid grid-cols-2 gap-2 h-full items-center">
          {[1, 2].map((i) => (
            <div key={i} className="p-1.5 border rounded space-y-1">
              <div className="w-5 h-5 bg-primary/30 rounded" />
              <div className="h-1.5 bg-muted-foreground/40 rounded w-3/4" />
              <div className="h-1 bg-muted-foreground/20 rounded w-full" />
            </div>
          ))}
        </div>
      );
    }
    if (variantId === 'features-alternating') {
      return (
        <div className="space-y-1 h-full flex flex-col justify-center">
          <div className="flex gap-2">
            <div className="flex-1 space-y-0.5">
              <div className="h-1.5 bg-muted-foreground/40 rounded w-3/4" />
              <div className="h-1 bg-muted-foreground/20 rounded w-full" />
            </div>
            <div className="w-8 h-6 bg-muted-foreground/20 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-6 bg-muted-foreground/20 rounded" />
            <div className="flex-1 space-y-0.5">
              <div className="h-1.5 bg-muted-foreground/40 rounded w-3/4" />
              <div className="h-1 bg-muted-foreground/20 rounded w-full" />
            </div>
          </div>
        </div>
      );
    }
    if (variantId === 'features-bento-grid') {
      return (
        <div className="grid grid-cols-3 grid-rows-2 gap-1 h-full">
          <div className="col-span-2 bg-muted-foreground/15 rounded p-1">
            <div className="h-1 bg-muted-foreground/30 rounded w-1/2" />
          </div>
          <div className="row-span-2 bg-muted-foreground/15 rounded" />
          <div className="bg-muted-foreground/15 rounded" />
          <div className="bg-muted-foreground/15 rounded" />
        </div>
      );
    }
  }

  // Pricing variants
  if (type === 'pricing') {
    if (variantId === 'pricing-three-tiers') {
      return (
        <div className="grid grid-cols-3 gap-2 h-full items-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn("p-1.5 rounded border space-y-1", i === 2 && "border-primary/50 bg-primary/5 scale-105")}>
              <div className="h-1.5 bg-muted-foreground/30 rounded w-1/2 mx-auto" />
              <div className="h-2 bg-muted-foreground/40 rounded w-2/3 mx-auto" />
              <div className="space-y-0.5">
                {[1, 2].map((j) => (
                  <div key={j} className="h-0.5 bg-muted-foreground/20 rounded w-full" />
                ))}
              </div>
              <div className="h-2.5 bg-primary/40 rounded w-full" />
            </div>
          ))}
        </div>
      );
    }
    if (variantId === 'pricing-two-tiers') {
      return (
        <div className="grid grid-cols-2 gap-3 h-full items-center px-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-2 rounded border space-y-1">
              <div className="h-1.5 bg-muted-foreground/30 rounded w-1/2" />
              <div className="h-2.5 bg-muted-foreground/40 rounded w-2/3" />
              <div className="h-3 bg-primary/40 rounded w-full mt-1" />
            </div>
          ))}
        </div>
      );
    }
  }

  // Testimonials variants
  if (type === 'testimonials') {
    if (variantId === 'testimonials-single-featured') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-2">
          <div className="h-1.5 bg-muted-foreground/30 rounded w-3/4 mb-1" />
          <div className="h-1 bg-muted-foreground/20 rounded w-1/2 mb-2" />
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
            <div className="h-1 bg-muted-foreground/20 rounded w-8" />
          </div>
        </div>
      );
    }
    if (variantId === 'testimonials-carousel') {
      return (
        <div className="flex items-center justify-center gap-2 h-full">
          <div className="w-2 h-2 bg-muted-foreground/20 rounded">←</div>
          <div className="flex-1 p-2 bg-background rounded border">
            <div className="h-1 bg-muted-foreground/30 rounded w-full mb-0.5" />
            <div className="h-1 bg-muted-foreground/20 rounded w-3/4 mb-1" />
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
              <div className="h-1 bg-muted-foreground/20 rounded w-6" />
            </div>
          </div>
          <div className="w-2 h-2 bg-muted-foreground/20 rounded">→</div>
        </div>
      );
    }
  }

  // CTA variants
  if (type === 'cta') {
    if (variantId === 'cta-centered-simple') {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-1">
          <div className="h-2.5 bg-muted-foreground/40 rounded w-1/2" />
          <div className="h-1.5 bg-muted-foreground/20 rounded w-1/3" />
          <div className="h-4 w-14 bg-primary/40 rounded mt-1" />
        </div>
      );
    }
    if (variantId === 'cta-with-form') {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-1">
          <div className="h-2 bg-muted-foreground/40 rounded w-1/2" />
          <div className="flex gap-1 w-2/3">
            <div className="flex-1 h-3 bg-muted-foreground/20 rounded" />
            <div className="h-3 w-8 bg-primary/40 rounded" />
          </div>
        </div>
      );
    }
    if (variantId === 'cta-split-with-image') {
      return (
        <div className="flex gap-2 items-center h-full">
          <div className="flex-1 space-y-1">
            <div className="h-2 bg-muted-foreground/40 rounded w-3/4" />
            <div className="h-1.5 bg-muted-foreground/20 rounded w-full" />
            <div className="h-3 w-10 bg-primary/40 rounded mt-1" />
          </div>
          <div className="w-1/3 h-full bg-muted-foreground/20 rounded flex items-center justify-center">
            <ImageIcon className="h-3 w-3 text-muted-foreground/40" />
          </div>
        </div>
      );
    }
    if (variantId === 'cta-banner') {
      return (
        <div className="h-full bg-primary/20 rounded flex items-center justify-between px-3">
          <div className="space-y-0.5">
            <div className="h-2 bg-primary/60 rounded w-16" />
            <div className="h-1 bg-primary/40 rounded w-12" />
          </div>
          <div className="h-4 w-10 bg-white/80 rounded" />
        </div>
      );
    }
  }

  // Default fallback - use the section type wireframe
  return <SectionTypeWireframe type={type} />;
}
