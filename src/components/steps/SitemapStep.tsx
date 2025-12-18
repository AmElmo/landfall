"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLandfall } from "@/lib/context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { STEPS } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Trash2, Home, FileText, Star, MoreHorizontal, ArrowLeft, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Page } from "@/lib/types";

export default function SitemapStep() {
  const router = useRouter();
  const { sitemap, updateSitemap, refreshData, isSaving, setCurrentStep } = useLandfall();
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPage, setNewPage] = useState({
    name: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
  });

  const stepIndex = 3;
  const totalSteps = STEPS.length;

  const generateId = () => `page_${Date.now()}`;

  const generateSlug = (name: string) => {
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
    if (sitemap && newPage.name) {
      const id = generateId();
      const slug = newPage.slug || generateSlug(newPage.name);
      const pageSlug = slug === "/" ? "home" : slug.replace(/^\//, "");

      const page: Page = {
        id,
        name: newPage.name,
        slug,
        isHomepage: false,
        metaTitle: newPage.metaTitle || newPage.name,
        metaDescription: newPage.metaDescription,
      };

      await updateSitemap({
        pages: [...sitemap.pages, page],
      });

      // Create the page file
      await fetch(`/api/config/pages/${pageSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: id, sections: [] }),
      });

      setNewPage({ name: "", slug: "", metaTitle: "", metaDescription: "" });
      setIsAddingPage(false);
      refreshData();
    }
  };

  const updatePageDetails = async (page: Page) => {
    if (sitemap) {
      await updateSitemap({
        pages: sitemap.pages.map((p) => (p.id === page.id ? page : p)),
      });
      setEditingPage(null);
    }
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

  const setAsHomepage = async (pageId: string) => {
    if (sitemap) {
      await updateSitemap({
        pages: sitemap.pages.map((p) => ({
          ...p,
          isHomepage: p.id === pageId,
          slug: p.id === pageId ? "/" : p.slug === "/" ? generateSlug(p.name) : p.slug,
        })),
      });
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
              Click on a page to edit, or add new pages to your site
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
              <Button onClick={() => setIsAddingPage(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Page
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Homepage at top */}
              {homepage && (
                <div className="flex flex-col items-center">
                  <PageCard
                    page={homepage}
                    isHomepage
                    onEdit={() => setEditingPage(homepage)}
                    onDelete={() => deletePage(homepage.id)}
                    onSetHomepage={() => {}}
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
                      width: `${Math.min(otherPages.length * 200 + 100, 800)}px`,
                    }}
                  />

                  {/* Child pages in a row */}
                  <div className="flex gap-6 flex-wrap justify-center mt-0">
                    {otherPages.map((page) => (
                      <div key={page.id} className="flex flex-col items-center">
                        {/* Vertical connector to each page */}
                        <div className="w-0.5 h-6 bg-border" />
                        <PageCard
                          page={page}
                          isHomepage={false}
                          onEdit={() => setEditingPage(page)}
                          onDelete={() => deletePage(page.id)}
                          onSetHomepage={() => setAsHomepage(page.id)}
                        />
                      </div>
                    ))}

                    {/* Add Page Card */}
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-6 bg-border" />
                      <button
                        onClick={() => setIsAddingPage(true)}
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
                    onClick={() => setIsAddingPage(true)}
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

      {/* Edit Page Dialog */}
      <Dialog
        open={editingPage !== null}
        onOpenChange={(open) => !open && setEditingPage(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
          </DialogHeader>
          {editingPage && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Page Name</Label>
                <Input
                  value={editingPage.name}
                  onChange={(e) =>
                    setEditingPage({ ...editingPage, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input
                  value={editingPage.slug}
                  onChange={(e) =>
                    setEditingPage({ ...editingPage, slug: e.target.value })
                  }
                  disabled={editingPage.isHomepage}
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={editingPage.metaTitle}
                  onChange={(e) =>
                    setEditingPage({ ...editingPage, metaTitle: e.target.value })
                  }
                  placeholder="Page title for SEO"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Input
                  value={editingPage.metaDescription}
                  onChange={(e) =>
                    setEditingPage({
                      ...editingPage,
                      metaDescription: e.target.value,
                    })
                  }
                  placeholder="Page description for SEO"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => updatePageDetails(editingPage)}
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Page Dialog */}
      <Dialog open={isAddingPage} onOpenChange={setIsAddingPage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Page Name</Label>
              <Input
                value={newPage.name}
                onChange={(e) => {
                  setNewPage({
                    ...newPage,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                placeholder="e.g., Pricing"
              />
            </div>
            <div className="space-y-2">
              <Label>URL Slug</Label>
              <Input
                value={newPage.slug}
                onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                placeholder="/pricing"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta Title (optional)</Label>
              <Input
                value={newPage.metaTitle}
                onChange={(e) => setNewPage({ ...newPage, metaTitle: e.target.value })}
                placeholder="Page title for SEO"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta Description (optional)</Label>
              <Input
                value={newPage.metaDescription}
                onChange={(e) =>
                  setNewPage({ ...newPage, metaDescription: e.target.value })
                }
                placeholder="Page description for SEO"
              />
            </div>
            <Button className="w-full" onClick={addPage} disabled={!newPage.name}>
              Add Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Page Card Component with inline actions
function PageCard({
  page,
  isHomepage,
  onEdit,
  onDelete,
  onSetHomepage,
}: {
  page: Page;
  isHomepage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetHomepage: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative px-6 py-4 rounded-xl border-2 shadow-lg cursor-pointer",
        "min-w-[160px] text-center transition-all hover:scale-105",
        isHomepage
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-white border-border hover:border-primary/50"
      )}
      onClick={onEdit}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        {isHomepage ? (
          <Home className="h-4 w-4" />
        ) : (
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span className={cn("font-semibold", !isHomepage && "text-sm font-medium")}>
          {page.name}
        </span>
      </div>
      <div className={cn("text-xs", isHomepage ? "opacity-80" : "text-muted-foreground")}>
        {page.slug}
      </div>

      {/* Actions dropdown */}
      <div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "p-1 rounded hover:bg-black/10",
                isHomepage ? "text-primary-foreground" : "text-muted-foreground"
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {!isHomepage && (
              <>
                <DropdownMenuItem onClick={onSetHomepage}>
                  <Star className="h-4 w-4 mr-2" />
                  Set as Homepage
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
