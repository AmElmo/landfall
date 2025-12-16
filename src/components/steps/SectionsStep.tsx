"use client";

import React, { useState } from "react";
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
  Image,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Section, SECTION_TYPES, SectionType } from "@/lib/types";

export default function SectionsStep() {
  const { sitemap, pages, updatePage, refreshData } = useLandfall();
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>("home");
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState<SectionType | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const currentPage = pages[selectedPageSlug];

  const generateId = () => `section_${Date.now()}`;

  const addSection = (type: SectionType, variant: string) => {
    if (currentPage) {
      const newSection: Section = {
        id: generateId(),
        type,
        layoutVariant: variant,
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

  if (!sitemap) return null;

  return (
    <OnboardingShell
      stepIndex={5}
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
            return (
              <button
                key={section.id}
                onClick={() => setEditingSection(section)}
                className="w-full flex items-center gap-3 p-4 border rounded-xl hover:border-primary/50 transition-all text-left"
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
              </button>
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedSectionType
                    ? `Select ${SECTION_TYPES[selectedSectionType]?.name} Layout`
                    : "Add Section"}
                </DialogTitle>
              </DialogHeader>

              {selectedSectionType ? (
                <div className="space-y-4 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedSectionType(null)}
                    className="mb-2"
                  >
                    ← Back to section types
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    {SECTION_TYPES[selectedSectionType]?.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => addSection(selectedSectionType, variant.id)}
                        className="p-4 border rounded-xl hover:border-primary/50 text-left transition-all"
                      >
                        <div className="font-medium">{variant.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {variant.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pt-4">
                  <div className="grid grid-cols-2 gap-3 pr-4">
                    {(Object.keys(SECTION_TYPES) as SectionType[]).map((type) => {
                      const sectionType = SECTION_TYPES[type];
                      return (
                        <button
                          key={type}
                          onClick={() => setSelectedSectionType(type)}
                          className="p-4 border rounded-xl hover:border-primary/50 text-left transition-all"
                        >
                          <div className="font-medium">{sectionType.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {sectionType.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {sectionType.variants.length} layouts
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
  const sectionType = SECTION_TYPES[section.type as keyof typeof SECTION_TYPES];
  const variant = sectionType?.variants.find((v) => v.id === section.layoutVariant);

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
        <div className="font-medium">{sectionType?.name || section.type}</div>
        <div className="text-sm text-muted-foreground">
          {variant?.name || section.layoutVariant}
        </div>
      </div>

      {/* Layout Variant Selector */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Layout Variant</Label>
        <div className="grid grid-cols-2 gap-2">
          {sectionType?.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => onUpdate({ layoutVariant: v.id })}
              className={cn(
                "p-3 border rounded-lg text-left transition-all text-sm",
                section.layoutVariant === v.id
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-2">
                {section.layoutVariant === v.id && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
                <div>
                  <div className="font-medium">{v.name}</div>
                  <div className="text-xs text-muted-foreground">{v.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

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

      {/* Visual Instructions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Image className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base font-medium">Visual Instructions</Label>
        </div>
        <Textarea
          value={section.visualInstructions}
          onChange={(e) => onUpdate({ visualInstructions: e.target.value })}
          placeholder="Describe what images, graphics, or visual elements should be included. Be specific about style, colors, and composition."
          className="min-h-[120px]"
        />
      </div>
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

        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-3">
            {sections.map((section, index) => {
              const sectionType =
                SECTION_TYPES[section.type as keyof typeof SECTION_TYPES];
              return (
                <div
                  key={section.id}
                  className="border-2 border-dashed border-muted rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-sm">
                      {sectionType?.name || section.type}
                    </span>
                  </div>

                  {/* Wireframe representation */}
                  <div className="bg-muted/30 rounded p-4 space-y-2">
                    {section.type === "hero" && (
                      <>
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted/60 rounded w-1/2" />
                        <div className="flex gap-2 mt-4">
                          <div className="h-8 w-24 bg-primary/20 rounded" />
                          <div className="h-8 w-24 bg-muted rounded" />
                        </div>
                      </>
                    )}
                    {section.type === "features" && (
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-1">
                            <div className="h-8 w-8 bg-muted rounded" />
                            <div className="h-2 bg-muted rounded w-3/4" />
                            <div className="h-2 bg-muted/60 rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    )}
                    {section.type === "testimonials" && (
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
                    )}
                    {section.type === "cta" && (
                      <div className="text-center space-y-2">
                        <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                        <div className="h-3 bg-muted/60 rounded w-1/3 mx-auto" />
                        <div className="h-8 w-28 bg-primary/20 rounded mx-auto mt-3" />
                      </div>
                    )}
                    {!["hero", "features", "testimonials", "cta"].includes(
                      section.type
                    ) && (
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted/60 rounded w-3/4" />
                        <div className="h-3 bg-muted/60 rounded w-2/3" />
                      </div>
                    )}
                  </div>

                  {(section.copyInstructions || section.visualInstructions) && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {section.copyInstructions && (
                        <div className="truncate">📝 {section.copyInstructions}</div>
                      )}
                      {section.visualInstructions && (
                        <div className="truncate">🖼️ {section.visualInstructions}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

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
