"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Upload, Link, Image as ImageIcon, ExternalLink, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Inspiration {
  id: string;
  type: "image" | "url";
  path?: string;
  url?: string;
  notes: string;
}

interface InspirationUploaderProps {
  inspirations: Inspiration[];
  onUpdate: (inspirations: Inspiration[]) => void;
  title?: string;
  description?: string;
  uploadCategory?: string;
}

export function InspirationUploader({
  inspirations,
  onUpdate,
  title = "Inspirations",
  description = "Add screenshots or URLs of designs you like. Include notes about what appeals to you.",
  uploadCategory = "inspirations",
}: InspirationUploaderProps) {
  const [mode, setMode] = useState<"image" | "url">("image");
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", uploadCategory);

    try {
      const res = await fetch("/api/assets/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const newInspiration: Inspiration = {
          id: `insp_${Date.now()}`,
          type: "image",
          path: data.path,
          notes: "",
        };
        onUpdate([...inspirations, newInspiration]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;

    // Basic URL validation
    let url = urlInput.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const newInspiration: Inspiration = {
      id: `insp_${Date.now()}`,
      type: "url",
      url: url,
      notes: "",
    };
    onUpdate([...inspirations, newInspiration]);
    setUrlInput("");
  };

  const handleRemove = (id: string) => {
    onUpdate(inspirations.filter((i) => i.id !== id));
  };

  const handleNotesChange = (id: string, notes: string) => {
    onUpdate(
      inspirations.map((i) => (i.id === id ? { ...i, notes } : i))
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
        <Label className="text-base font-medium">{title}</Label>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>

      {/* Existing inspirations */}
      {inspirations.length > 0 && (
        <div className="space-y-4">
          {inspirations.map((insp) => (
            <div
              key={insp.id}
              className="border rounded-lg overflow-hidden bg-muted/20"
            >
              {/* Preview */}
              <div className="relative aspect-video bg-muted">
                {insp.type === "image" && insp.path && (
                  <img
                    src={insp.path}
                    alt="Inspiration"
                    className="w-full h-full object-cover"
                  />
                )}
                {insp.type === "url" && insp.url && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                    <Link className="h-8 w-8 text-muted-foreground" />
                    <a
                      href={insp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 max-w-full"
                    >
                      <span className="truncate">{insp.url}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </div>
                )}
                <button
                  onClick={() => handleRemove(insp.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 hover:bg-background transition-colors shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Notes input */}
              <div className="p-3 border-t">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-2 flex-shrink-0" />
                  <Textarea
                    placeholder="What do you like about this? (optional)"
                    value={insp.notes}
                    onChange={(e) => handleNotesChange(insp.id, e.target.value)}
                    className="min-h-[60px] text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new inspiration */}
      <div className="border rounded-lg p-4 space-y-4">
        {/* Toggle between image and URL */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "image" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("image")}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          <Button
            type="button"
            variant={mode === "url" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("url")}
            className="flex-1"
          >
            <Link className="h-4 w-4 mr-2" />
            Add URL
          </Button>
        </div>

        {/* Image upload */}
        {mode === "image" && (
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isUploading
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isUploading ? "Uploading..." : "Click to upload a screenshot"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG up to 5MB
            </p>
          </div>
        )}

        {/* URL input */}
        {mode === "url" && (
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
              className="flex-1"
            />
            <Button onClick={handleAddUrl} disabled={!urlInput.trim()}>
              Add
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
