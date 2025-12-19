"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLandfall } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { STEPS, SECTION_TYPES, SectionType, Section } from "@/lib/types";
import { Plus, Trash2, Home, FileText, ArrowLeft, Loader2, ChevronDown, ChevronRight, Layers, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Page } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

// Available section types for the sitemap (simplified list)
const SITEMAP_SECTION_TYPES: { type: SectionType; name: string }[] = [
  { type: "hero", name: "Hero" },
  { type: "features", name: "Features" },
  { type: "how-it-works", name: "How It Works" },
  { type: "testimonials", name: "Testimonials" },
  { type: "pricing", name: "Pricing" },
  { type: "faq", name: "FAQ" },
  { type: "cta", name: "CTA" },
  { type: "team", name: "Team" },
  { type: "stats", name: "Stats" },
  { type: "contact", name: "Contact" },
  { type: "logos", name: "Logos" },
  { type: "content", name: "Content" },
];

export default function SitemapStep() {
  const router = useRouter();
  const { sitemap, updateSitemap, pages, updatePage, refreshData, isSaving, setCurrentStep } = useLandfall();
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);
  const [addingSectionToPageId, setAddingSectionToPageId] = useState<string | null>(null);

  const stepIndex = 3;
  const totalSteps = STEPS.length;

  const generateId = () => `page_${Date.now()}`;

  const generateSlug = (name: string) => {
    if (!name.trim()) return "/";
    return "/" + name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

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

  const addPage = async () => {
    if (sitemap) {
      const id = generateId();
      const page: Page = {
        id,
        name: "",
        slug: "/new-page",
        isHomepage: false,
        metaTitle: "",
        metaDescription: "",
      };

      await updateSitemap({
        pages: [...sitemap.pages, page],
      });

      // Create the page file
      await fetch(`/api/config/pages/new-page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: id, sections: [] }),
      });

      refreshData();

      // Start editing the new page
      setEditingPageId(id);
      setEditingValue("");
    }
  };

  const updatePageName = async (pageId: string, newName: string) => {
    if (sitemap) {
      const page = sitemap.pages.find((p) => p.id === pageId);
      if (page) {
        const oldSlug = page.slug === "/" ? "home" : page.slug.replace(/^\//, "");
        const newSlug = page.isHomepage ? "/" : generateSlug(newName);
        const newSlugClean = newSlug === "/" ? "home" : newSlug.replace(/^\//, "");

        await updateSitemap({
          pages: sitemap.pages.map((p) =>
            p.id === pageId
              ? { ...p, name: newName, slug: newSlug, metaTitle: newName }
              : p
          ),
        });

        // Rename the page file if slug changed
        if (oldSlug !== newSlugClean && !page.isHomepage) {
          await fetch(`/api/config/pages/${oldSlug}`, { method: "DELETE" });
          await fetch(`/api/config/pages/${newSlugClean}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pageId, sections: [] }),
          });
        }

        refreshData();
      }
    }
    setEditingPageId(null);
  };

  const deletePage = async (pageId: string) => {
    if (sitemap) {
      const page = sitemap.pages.find((p) => p.id === pageId);
      if (page && !page.isHomepage) {
        const pageSlug = page.slug === "/" ? "home" : page.slug.replace(/^\//, "");

        await updateSitemap({
          pages: sitemap.pages.filter((p) => p.id !== pageId),
        });

        // Delete the page file
        await fetch(`/api/config/pages/${pageSlug}`, { method: "DELETE" });
        refreshData();
      }
    }
  };

  const startEditing = (page: Page) => {
    setEditingPageId(page.id);
    setEditingValue(page.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent, pageId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updatePageName(pageId, editingValue);
    } else if (e.key === "Escape") {
      setEditingPageId(null);
    }
  };

  const getPageSlug = (page: Page) => {
    return page.slug === "/" ? "home" : page.slug.replace(/^\//, "");
  };

  const getPageSections = (page: Page): Section[] => {
    const pageSlug = getPageSlug(page);
    return pages[pageSlug]?.sections || [];
  };

  const addSectionToPage = (page: Page, sectionType: SectionType | 'custom', customName?: string) => {
    const pageSlug = getPageSlug(page);
    const currentSections = getPageSections(page);

    const newSection: Section = {
      id: `section_${Date.now()}`,
      type: sectionType,
      customType: sectionType === 'custom' ? customName : undefined,
      layoutVariant: sectionType === 'custom' ? 'custom' : (SECTION_TYPES[sectionType]?.variants[0]?.id || sectionType),
      order: currentSections.length + 1,
      copyInstructions: "",
      visualInstructions: "",
      inspirations: [],
    };
    updatePage(pageSlug, {
      sections: [...currentSections, newSection],
    });
    setAddingSectionToPageId(null);
  };

  const removeSectionFromPage = (page: Page, sectionId: string) => {
    const pageSlug = getPageSlug(page);
    const currentSections = getPageSections(page);
    updatePage(pageSlug, {
      sections: currentSections
        .filter((s) => s.id !== sectionId)
        .map((s, i) => ({ ...s, order: i + 1 })),
    });
  };

  const toggleExpanded = (pageId: string) => {
    setExpandedPageId(expandedPageId === pageId ? null : pageId);
  };

  if (!sitemap) return null;

  const homepage = sitemap.pages.find((p) => p.isHomepage);
  const otherPages = sitemap.pages.filter((p) => !p.isHomepage);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b bg-background px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            <span className="text-sm text-muted-foreground">
              {stepIndex}/{totalSteps}
            </span>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">Plan your pages</h1>
            <p className="text-sm text-muted-foreground">
              Click on a page name to edit it directly
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Step Progress Dots */}
            <div className="flex items-center gap-2 mr-4">
              {STEPS.map((step, idx) => (
                <Tooltip key={step.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigateToStep(step.id)}
                      className={cn(
                        "rounded-full transition-all hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary/50",
                        idx + 1 === stepIndex
                          ? "w-10 h-3 bg-primary"
                          : idx + 1 < stepIndex
                          ? "w-3 h-3 bg-primary/70 hover:bg-primary"
                          : "w-3 h-3 bg-muted-foreground/40 hover:bg-muted-foreground/60"
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8}>
                    <span className="font-medium">{step.name}</span>
                    <span className="ml-1.5 text-muted-foreground">({idx + 1}/{STEPS.length})</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
            <Button onClick={handleNext} disabled={isSaving}>
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

      {/* Full Page Sitemap Editor */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {sitemap.pages.length === 0 ? (
            <div className="text-center py-24">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-medium mb-2">No pages yet</h2>
              <p className="text-muted-foreground mb-6">
                Add your first page to get started
              </p>
              <Button onClick={addPage}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Page
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Homepage at top */}
              {homepage && (
                <div className="flex flex-col items-center">
                  <InlinePageCard
                    page={homepage}
                    isHomepage
                    isEditing={editingPageId === homepage.id}
                    editingValue={editingValue}
                    onStartEdit={() => startEditing(homepage)}
                    onEditChange={setEditingValue}
                    onEditSubmit={() => updatePageName(homepage.id, editingValue)}
                    onKeyDown={(e) => handleKeyDown(e, homepage.id)}
                    onDelete={() => {}}
                    sections={getPageSections(homepage)}
                    isExpanded={expandedPageId === homepage.id}
                    onToggleExpand={() => toggleExpanded(homepage.id)}
                    isAddingSection={addingSectionToPageId === homepage.id}
                    onStartAddSection={() => setAddingSectionToPageId(homepage.id)}
                    onCancelAddSection={() => setAddingSectionToPageId(null)}
                    onAddSection={(type, customName) => addSectionToPage(homepage, type, customName)}
                    onRemoveSection={(sectionId) => removeSectionFromPage(homepage, sectionId)}
                  />

                  {/* Connector line from homepage */}
                  {otherPages.length > 0 && (
                    <div className="w-0.5 h-8 bg-border" />
                  )}
                </div>
              )}

              {/* Horizontal connector for child pages */}
              {otherPages.length > 0 && (
                <div className="w-full flex flex-col items-center">
                  <div
                    className="h-0.5 bg-border"
                    style={{
                      width: `${Math.min((otherPages.length + 1) * 196 + 80, 1000)}px`,
                    }}
                  />

                  {/* Child pages in horizontal flex row */}
                  <div className="flex flex-wrap justify-center gap-4 mt-0 items-start">
                    {otherPages.map((page) => (
                      <div key={page.id} className="flex flex-col items-center w-[180px] shrink-0">
                        {/* Vertical connector to each page */}
                        <div className="w-0.5 h-6 bg-border" />
                        <InlinePageCard
                          page={page}
                          isHomepage={false}
                          isEditing={editingPageId === page.id}
                          editingValue={editingValue}
                          onStartEdit={() => startEditing(page)}
                          onEditChange={setEditingValue}
                          onEditSubmit={() => updatePageName(page.id, editingValue)}
                          onKeyDown={(e) => handleKeyDown(e, page.id)}
                          onDelete={() => deletePage(page.id)}
                          sections={getPageSections(page)}
                          isExpanded={expandedPageId === page.id}
                          onToggleExpand={() => toggleExpanded(page.id)}
                          isAddingSection={addingSectionToPageId === page.id}
                          onStartAddSection={() => setAddingSectionToPageId(page.id)}
                          onCancelAddSection={() => setAddingSectionToPageId(null)}
                          onAddSection={(type, customName) => addSectionToPage(page, type, customName)}
                          onRemoveSection={(sectionId) => removeSectionFromPage(page, sectionId)}
                        />
                      </div>
                    ))}

                    {/* Add Page Card */}
                    <div className="flex flex-col items-center w-[180px] shrink-0">
                      <div className="w-0.5 h-6 bg-border" />
                      <button
                        onClick={addPage}
                        className={cn(
                          "px-6 py-4 rounded-xl border-2 border-dashed",
                          "bg-white/50 hover:bg-white hover:border-primary/50",
                          "w-full h-[110px] text-center transition-all hover:scale-105 cursor-pointer",
                          "flex flex-col items-center justify-center gap-2"
                        )}
                      >
                        <Plus className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Add Page</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add first child page if only homepage exists */}
              {otherPages.length === 0 && homepage && (
                <div className="flex flex-col items-center mt-8">
                  <button
                    onClick={addPage}
                    className={cn(
                      "px-6 py-4 rounded-xl border-2 border-dashed",
                      "bg-white/50 hover:bg-white hover:border-primary/50",
                      "min-w-[160px] text-center transition-all hover:scale-105 cursor-pointer",
                      "flex flex-col items-center justify-center gap-2"
                    )}
                  >
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Add Page</span>
                  </button>
                </div>
              )}

              {/* Legend */}
              <div className="mt-16 flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span>Homepage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-border bg-white" />
                  <span>Page</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-border" />
                  <span>Link</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline editable Page Card Component with sections
function InlinePageCard({
  page,
  isHomepage,
  isEditing,
  editingValue,
  onStartEdit,
  onEditChange,
  onEditSubmit,
  onKeyDown,
  onDelete,
  sections,
  isExpanded,
  onToggleExpand,
  isAddingSection,
  onStartAddSection,
  onCancelAddSection,
  onAddSection,
  onRemoveSection,
}: {
  page: Page;
  isHomepage: boolean;
  isEditing: boolean;
  editingValue: string;
  onStartEdit: () => void;
  onEditChange: (value: string) => void;
  onEditSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onDelete: () => void;
  sections: Section[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  isAddingSection: boolean;
  onStartAddSection: () => void;
  onCancelAddSection: () => void;
  onAddSection: (type: SectionType | 'custom', customName?: string) => void;
  onRemoveSection: (sectionId: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customSectionName, setCustomSectionName] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingCustom && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [isAddingCustom]);

  const handleAddCustomSection = () => {
    if (customSectionName.trim()) {
      onAddSection('custom', customSectionName.trim());
      setCustomSectionName("");
      setIsAddingCustom(false);
    }
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomSection();
    } else if (e.key === "Escape") {
      setIsAddingCustom(false);
      setCustomSectionName("");
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const generateSlug = (name: string) => {
    if (!name.trim()) return "/";
    return "/" + name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "group relative px-6 py-4 rounded-xl border-2 shadow-lg",
          "min-w-[160px] text-center transition-all",
          isHomepage
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-white border-border hover:border-primary/50"
        )}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          {isHomepage ? (
            <Home className="h-4 w-4" />
          ) : (
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editingValue}
              onChange={(e) => onEditChange(e.target.value)}
              onBlur={onEditSubmit}
              onKeyDown={onKeyDown}
              className={cn(
                "bg-transparent border-b outline-none text-center font-medium w-24",
                isHomepage
                  ? "border-primary-foreground/50 text-primary-foreground"
                  : "border-border text-foreground"
              )}
              placeholder="Page name"
            />
          ) : (
            <span
              onClick={onStartEdit}
              className={cn(
                "font-medium cursor-text hover:underline",
                !isHomepage && "text-sm"
              )}
            >
              {page.name || "Untitled"}
            </span>
          )}
        </div>
        <div className={cn("text-xs", isHomepage ? "opacity-80" : "text-muted-foreground")}>
          {isEditing ? generateSlug(editingValue) : page.slug}
        </div>

        {/* Sections toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className={cn(
            "mt-2 flex items-center justify-center gap-1 text-xs px-2 py-1 rounded transition-colors w-full",
            isHomepage
              ? "bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          <Layers className="h-3 w-3" />
          <span>{sections.length} section{sections.length !== 1 ? "s" : ""}</span>
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>

        {/* Delete button - only visible on hover for non-homepage */}
        {!isHomepage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expanded sections list */}
      {isExpanded && (
        <div className="mt-2 w-full max-w-[280px]">
          <div className="bg-white border rounded-lg shadow-sm p-2 space-y-1">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className="flex items-center justify-between px-2 py-1.5 bg-muted/50 rounded text-xs group/section"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{idx + 1}.</span>
                  <span className="font-medium">
                    {section.type === 'custom'
                      ? section.customType
                      : (SECTION_TYPES[section.type as SectionType]?.name || section.type)}
                  </span>
                  {section.type === 'custom' && !section.customType && (
                    <span className="text-muted-foreground italic">(unnamed)</span>
                  )}
                </div>
                <button
                  onClick={() => onRemoveSection(section.id)}
                  className="opacity-0 group-hover/section:opacity-100 p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Add section button or picker */}
            {isAddingSection ? (
              <div className="p-2 border rounded bg-background space-y-2">
                {isAddingCustom ? (
                  // Custom section name input
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Enter custom section name:
                    </div>
                    <Input
                      ref={customInputRef}
                      value={customSectionName}
                      onChange={(e) => setCustomSectionName(e.target.value)}
                      onKeyDown={handleCustomKeyDown}
                      placeholder="e.g., Case Studies, Partners..."
                      className="h-8 text-xs"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={handleAddCustomSection}
                        disabled={!customSectionName.trim()}
                        className="flex-1 px-2 py-1.5 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Add Section
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingCustom(false);
                          setCustomSectionName("");
                        }}
                        className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  // Section type picker
                  <>
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Select section type:
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="grid grid-cols-2 gap-1">
                        {SITEMAP_SECTION_TYPES.map((st) => (
                          <button
                            key={st.type}
                            onClick={() => onAddSection(st.type)}
                            className="px-2 py-1.5 text-xs text-left rounded hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            {st.name}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                    {/* Custom section option */}
                    <button
                      onClick={() => setIsAddingCustom(true)}
                      className="w-full flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium border-t border-dashed text-primary hover:bg-primary/5 rounded transition-colors mt-1"
                    >
                      <Pencil className="h-3 w-3" />
                      Add Custom Section
                    </button>
                    <button
                      onClick={onCancelAddSection}
                      className="w-full text-xs text-muted-foreground hover:text-foreground py-1"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onStartAddSection}
                className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Section
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
