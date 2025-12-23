"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X, Upload, Link, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageInspiration } from "@/lib/types";

interface ImageInspirationEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elementRole: string;
  inspiration?: ImageInspiration;
  onSave: (inspiration: ImageInspiration) => void;
  onDelete?: () => void;
}

// Format role for display (hero-image -> Hero Image)
function formatRole(role: string): string {
  return role
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ImageInspirationEditor({
  open,
  onOpenChange,
  elementRole,
  inspiration,
  onSave,
  onDelete,
}: ImageInspirationEditorProps) {
  const [mode, setMode] = useState<"image" | "url">("image");
  const [urlInput, setUrlInput] = useState("");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state when dialog opens or inspiration changes
  useEffect(() => {
    if (open && inspiration) {
      setDescription(inspiration.description || "");
      setImagePath(inspiration.path);
      setImageUrl(inspiration.url);
      setMode(inspiration.type || "image");
      if (inspiration.url) {
        setUrlInput(inspiration.url);
      }
    } else if (open) {
      // Reset for new inspiration
      setDescription("");
      setImagePath(undefined);
      setImageUrl(undefined);
      setUrlInput("");
      setMode("image");
    }
  }, [open, inspiration]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "image-inspirations");

    try {
      const res = await fetch("/api/assets/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImagePath(data.path);
        setImageUrl(undefined);
        setMode("image");
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

    let url = urlInput.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    setImageUrl(url);
    setImagePath(undefined);
    setMode("url");
  };

  const handleRemoveImage = () => {
    setImagePath(undefined);
    setImageUrl(undefined);
    setUrlInput("");
  };

  const handleSave = () => {
    const newInspiration: ImageInspiration = {
      id: inspiration?.id || `img_insp_${Date.now()}`,
      elementRole,
      type: mode,
      path: imagePath,
      url: imageUrl,
      description: description.trim(),
    };
    onSave(newInspiration);
    onOpenChange(false);
  };

  const hasImage = imagePath || imageUrl;
  const canSave = description.trim().length > 0 || hasImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            {formatRole(elementRole)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Reference Image Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Reference Image (Optional)</Label>

            {hasImage ? (
              <div className="relative rounded-lg overflow-hidden border bg-muted/30">
                <img
                  src={imagePath || imageUrl}
                  alt="Reference"
                  className="w-full h-40 object-contain"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Mode Toggle */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setMode("image")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                      mode === "image"
                        ? "bg-background shadow-sm font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </button>
                  <button
                    onClick={() => setMode("url")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                      mode === "url"
                        ? "bg-background shadow-sm font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link className="w-3.5 h-3.5" />
                    URL
                  </button>
                </div>

                {/* Upload or URL input */}
                {mode === "image" ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                      "hover:border-primary hover:bg-primary/5",
                      isUploading && "pointer-events-none opacity-50"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload a reference image
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                    />
                    <Button onClick={handleAddUrl} size="sm" disabled={!urlInput.trim()}>
                      Add
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Describe what this ${formatRole(elementRole).toLowerCase()} should show...`}
              className="min-h-[100px] text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be specific about style, content, mood, colors, and any important details.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          {inspiration && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDelete();
                onOpenChange(false);
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Remove
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ImageInspirationEditor;
