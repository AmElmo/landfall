"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLandfall } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { STEPS } from "@/lib/types";
import { Plus, Trash2, Home, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Page } from "@/lib/types";

export default function SitemapStep() {
  const router = useRouter();
  const { sitemap, updateSitemap, refreshData, isSaving, setCurrentStep } = useLandfall();
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

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
            <div className="flex items-center gap-1.5 mr-4">
              {STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => navigateToStep(step.id)}
                  title={step.name}
                  className={cn(
                    "h-2 rounded-full transition-all hover:scale-110",
                    idx + 1 === stepIndex
                      ? "w-8 bg-primary"
                      : idx + 1 < stepIndex
                      ? "w-2 bg-primary/60 hover:bg-primary/80"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
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
        <div className="max-w-4xl mx-auto">
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
                  />

                  {/* Connector line from homepage */}
                  {otherPages.length > 0 && (
                    <div className="w-0.5 h-8 bg-border" />
                  )}
                </div>
              )}

              {/* Horizontal connector for child pages */}
              {otherPages.length > 0 && (
                <>
                  <div
                    className="h-0.5 bg-border"
                    style={{
                      width: `${Math.min((otherPages.length + 1) * 200 + 100, 800)}px`,
                    }}
                  />

                  {/* Child pages in a row */}
                  <div className="flex gap-6 flex-wrap justify-center mt-0">
                    {otherPages.map((page) => (
                      <div key={page.id} className="flex flex-col items-center">
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
                        />
                      </div>
                    ))}

                    {/* Add Page Card */}
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-6 bg-border" />
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
                  </div>
                </>
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

// Inline editable Page Card Component
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
}) {
  const inputRef = useRef<HTMLInputElement>(null);

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
  );
}
