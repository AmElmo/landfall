"use client";

import React, { useState } from "react";
import { OnboardingShell } from "@/components/layout/OnboardingShell";
import { useLandfall } from "@/lib/context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, Home, FileText, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Page } from "@/lib/types";

export default function SitemapStep() {
  const { sitemap, updateSitemap, pages, updatePage, refreshData } = useLandfall();
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPage, setNewPage] = useState({
    name: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
  });
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const generateId = () => `page_${Date.now()}`;

  const generateSlug = (name: string) => {
    return "/" + name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
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

  return (
    <OnboardingShell
      stepIndex={3}
      title="Plan your pages"
      description="Define the pages for your landing site. You can add, remove, or reorder pages later."
      preview={<SitemapPreview sitemap={sitemap} />}
    >
      {/* Page List */}
      <div className="space-y-3">
        {sitemap.pages.map((page, index) => (
          <div
            key={page.id}
            className={cn(
              "group flex items-center gap-3 p-4 border rounded-xl transition-all",
              page.isHomepage
                ? "border-primary/50 bg-primary/5"
                : "border-border hover:border-primary/30"
            )}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {page.isHomepage ? (
                  <Home className="h-4 w-4 text-primary" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{page.name}</span>
                {page.isHomepage && (
                  <Badge variant="secondary" className="text-xs">
                    Homepage
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{page.slug}</div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!page.isHomepage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAsHomepage(page.id)}
                  className="text-muted-foreground"
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}

              <Dialog
                open={editingPage?.id === page.id}
                onOpenChange={(open) => !open && setEditingPage(null)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPage(page)}
                  >
                    Edit
                  </Button>
                </DialogTrigger>
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

              {!page.isHomepage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => deletePage(page.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Page Dialog */}
      <Dialog open={isAddingPage} onOpenChange={setIsAddingPage}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Page
          </Button>
        </DialogTrigger>
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
    </OnboardingShell>
  );
}

function SitemapPreview({
  sitemap,
}: {
  sitemap: NonNullable<ReturnType<typeof useLandfall>["sitemap"]>;
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
        </div>

        <div className="p-8 min-h-[500px]">
          <h3 className="text-lg font-semibold mb-6">Site Structure</h3>

          {/* Visual Sitemap */}
          <div className="space-y-4">
            {sitemap.pages.map((page, index) => (
              <div key={page.id} className="flex items-start gap-4">
                {/* Connection Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      page.isHomepage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {page.isHomepage ? (
                      <Home className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  {index < sitemap.pages.length - 1 && (
                    <div className="w-0.5 h-8 bg-border" />
                  )}
                </div>

                {/* Page Info */}
                <div className="flex-1 pb-4">
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="font-medium">{page.name}</div>
                    <div className="text-sm text-muted-foreground">{page.slug}</div>
                    {page.metaTitle && (
                      <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                        {page.metaTitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sitemap.pages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No pages added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
