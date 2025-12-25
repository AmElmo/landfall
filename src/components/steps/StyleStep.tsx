"use client";

import { useState, useEffect } from "react";
import { OnboardingShell } from "@/components/layout/OnboardingShell";
import { useLandfall } from "@/lib/context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paintbrush, Type, Square, Sun, Plus, Rocket, Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { InspirationUploader, Inspiration } from "@/components/shared/InspirationUploader";
import { preloadGoogleFonts, useGoogleFont } from "@/hooks/useGoogleFonts";
import { ColorPicker } from "@/components/ui/color-picker";

const STYLE_KEYWORDS = [
  "Modern",
  "Minimal",
  "Clean",
  "Bold",
  "Playful",
  "Corporate",
  "Elegant",
  "Tech",
  "Creative",
  "Professional",
  "Friendly",
  "Luxury",
];

const MAX_KEYWORDS = 3;

const BORDER_RADIUS_OPTIONS = [
  { id: "sharp", name: "Sharp", preview: "rounded-none" },
  { id: "slightly-rounded", name: "Slightly Rounded", preview: "rounded-sm" },
  { id: "rounded", name: "Rounded", preview: "rounded-lg" },
  { id: "pill", name: "Pill", preview: "rounded-full" },
] as const;

const SHADOW_OPTIONS = [
  { id: "none", name: "None" },
  { id: "subtle", name: "Subtle" },
  { id: "medium", name: "Medium" },
  { id: "dramatic", name: "Dramatic" },
] as const;

// Simplified color fields - only the essential ones that reflect on the preview
const COLOR_FIELDS = [
  { key: "primary", label: "Primary", description: "Buttons, links, accents" },
  { key: "background", label: "Background", description: "Page background" },
  { key: "text", label: "Text", description: "Headings and body text" },
  { key: "textMuted", label: "Muted Text", description: "Secondary text" },
] as const;

// Predefined color palettes - 42 popular landing page color schemes
const COLOR_PALETTES = [
  // Light themes - Clean & Modern
  { id: "ocean", name: "Ocean", category: "Light", colors: { primary: "#0ea5e9", background: "#ffffff", text: "#0f172a", textMuted: "#64748b" } },
  { id: "forest", name: "Forest", category: "Light", colors: { primary: "#22c55e", background: "#fafaf9", text: "#1c1917", textMuted: "#78716c" } },
  { id: "sunset", name: "Sunset", category: "Light", colors: { primary: "#f97316", background: "#fffbeb", text: "#292524", textMuted: "#78716c" } },
  { id: "berry", name: "Berry", category: "Light", colors: { primary: "#ec4899", background: "#fdf2f8", text: "#1f2937", textMuted: "#6b7280" } },
  { id: "slate", name: "Slate", category: "Light", colors: { primary: "#475569", background: "#f8fafc", text: "#0f172a", textMuted: "#64748b" } },
  { id: "lavender", name: "Lavender", category: "Light", colors: { primary: "#8b5cf6", background: "#faf5ff", text: "#1e1b4b", textMuted: "#6b7280" } },
  { id: "coral", name: "Coral", category: "Light", colors: { primary: "#f43f5e", background: "#ffffff", text: "#18181b", textMuted: "#71717a" } },
  { id: "mint", name: "Mint", category: "Light", colors: { primary: "#14b8a6", background: "#f0fdfa", text: "#134e4a", textMuted: "#5eead4" } },
  { id: "azure", name: "Azure", category: "Light", colors: { primary: "#3b82f6", background: "#f8fafc", text: "#1e293b", textMuted: "#64748b" } },
  { id: "lime", name: "Lime", category: "Light", colors: { primary: "#84cc16", background: "#fefce8", text: "#1a2e05", textMuted: "#65a30d" } },
  { id: "sky", name: "Sky", category: "Light", colors: { primary: "#06b6d4", background: "#ecfeff", text: "#164e63", textMuted: "#0891b2" } },
  { id: "peach", name: "Peach", category: "Light", colors: { primary: "#fb923c", background: "#fff7ed", text: "#431407", textMuted: "#ea580c" } },
  { id: "blush", name: "Blush", category: "Light", colors: { primary: "#f472b6", background: "#fdf2f8", text: "#500724", textMuted: "#db2777" } },
  { id: "sage", name: "Sage", category: "Light", colors: { primary: "#4ade80", background: "#f0fdf4", text: "#14532d", textMuted: "#16a34a" } },
  // Light themes - Corporate & Professional
  { id: "corporate", name: "Corporate", category: "Light", colors: { primary: "#2563eb", background: "#ffffff", text: "#1e293b", textMuted: "#475569" } },
  { id: "finance", name: "Finance", category: "Light", colors: { primary: "#0d9488", background: "#f8fafc", text: "#0f172a", textMuted: "#64748b" } },
  { id: "health", name: "Health", category: "Light", colors: { primary: "#06b6d4", background: "#ffffff", text: "#0f172a", textMuted: "#64748b" } },
  { id: "legal", name: "Legal", category: "Light", colors: { primary: "#1e40af", background: "#f8fafc", text: "#111827", textMuted: "#6b7280" } },
  { id: "consulting", name: "Consulting", category: "Light", colors: { primary: "#7c3aed", background: "#ffffff", text: "#18181b", textMuted: "#71717a" } },
  { id: "saas", name: "SaaS", category: "Light", colors: { primary: "#6366f1", background: "#fafafa", text: "#171717", textMuted: "#737373" } },
  { id: "startup", name: "Startup", category: "Light", colors: { primary: "#f59e0b", background: "#ffffff", text: "#1f2937", textMuted: "#6b7280" } },
  // Dark themes - Bold & Modern
  { id: "midnight", name: "Midnight", category: "Dark", colors: { primary: "#6366f1", background: "#0f172a", text: "#f8fafc", textMuted: "#94a3b8" } },
  { id: "amber-dark", name: "Amber Dark", category: "Dark", colors: { primary: "#f59e0b", background: "#1c1917", text: "#fef3c7", textMuted: "#a8a29e" } },
  { id: "rose-dark", name: "Rose Dark", category: "Dark", colors: { primary: "#e11d48", background: "#0c0a09", text: "#fafaf9", textMuted: "#a8a29e" } },
  { id: "emerald-dark", name: "Emerald Dark", category: "Dark", colors: { primary: "#10b981", background: "#18181b", text: "#f4f4f5", textMuted: "#a1a1aa" } },
  { id: "cyber", name: "Cyber", category: "Dark", colors: { primary: "#22d3ee", background: "#0a0a0a", text: "#fafafa", textMuted: "#a3a3a3" } },
  { id: "neon", name: "Neon", category: "Dark", colors: { primary: "#a855f7", background: "#09090b", text: "#fafafa", textMuted: "#71717a" } },
  { id: "matrix", name: "Matrix", category: "Dark", colors: { primary: "#22c55e", background: "#030712", text: "#f9fafb", textMuted: "#9ca3af" } },
  { id: "aurora", name: "Aurora", category: "Dark", colors: { primary: "#818cf8", background: "#1e1b4b", text: "#e0e7ff", textMuted: "#a5b4fc" } },
  { id: "obsidian", name: "Obsidian", category: "Dark", colors: { primary: "#f97316", background: "#171717", text: "#fafafa", textMuted: "#a3a3a3" } },
  { id: "carbon", name: "Carbon", category: "Dark", colors: { primary: "#38bdf8", background: "#0c0a09", text: "#fafaf9", textMuted: "#a8a29e" } },
  { id: "cosmos", name: "Cosmos", category: "Dark", colors: { primary: "#c084fc", background: "#0f0f23", text: "#f5f5f5", textMuted: "#8b8b8b" } },
  { id: "void", name: "Void", category: "Dark", colors: { primary: "#f472b6", background: "#0a0a0a", text: "#ffffff", textMuted: "#737373" } },
  // Warm & Vibrant
  { id: "sunshine", name: "Sunshine", category: "Warm", colors: { primary: "#eab308", background: "#fffbeb", text: "#422006", textMuted: "#854d0e" } },
  { id: "tangerine", name: "Tangerine", category: "Warm", colors: { primary: "#ea580c", background: "#fff7ed", text: "#431407", textMuted: "#9a3412" } },
  { id: "cherry", name: "Cherry", category: "Warm", colors: { primary: "#dc2626", background: "#fef2f2", text: "#450a0a", textMuted: "#b91c1c" } },
  { id: "flamingo", name: "Flamingo", category: "Warm", colors: { primary: "#db2777", background: "#fdf2f8", text: "#500724", textMuted: "#be185d" } },
  // Cool & Calm
  { id: "glacier", name: "Glacier", category: "Cool", colors: { primary: "#0284c7", background: "#f0f9ff", text: "#0c4a6e", textMuted: "#0369a1" } },
  { id: "arctic", name: "Arctic", category: "Cool", colors: { primary: "#0891b2", background: "#ecfeff", text: "#164e63", textMuted: "#0e7490" } },
  { id: "violet", name: "Violet", category: "Cool", colors: { primary: "#7c3aed", background: "#f5f3ff", text: "#2e1065", textMuted: "#6d28d9" } },
  { id: "indigo", name: "Indigo", category: "Cool", colors: { primary: "#4f46e5", background: "#eef2ff", text: "#1e1b4b", textMuted: "#4338ca" } },
  { id: "pacific", name: "Pacific", category: "Cool", colors: { primary: "#0d9488", background: "#f0fdfa", text: "#134e4a", textMuted: "#0f766e" } },
] as const;

// Popular fonts for landing pages
const POPULAR_FONTS = [
  { value: "Inter", label: "Inter", type: "sans-serif" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", type: "sans-serif" },
  { value: "DM Sans", label: "DM Sans", type: "sans-serif" },
  { value: "Outfit", label: "Outfit", type: "sans-serif" },
  { value: "Space Grotesk", label: "Space Grotesk", type: "sans-serif" },
  { value: "Manrope", label: "Manrope", type: "sans-serif" },
  { value: "Sora", label: "Sora", type: "sans-serif" },
  { value: "Poppins", label: "Poppins", type: "sans-serif" },
  { value: "Montserrat", label: "Montserrat", type: "sans-serif" },
  { value: "Lato", label: "Lato", type: "sans-serif" },
  { value: "Roboto", label: "Roboto", type: "sans-serif" },
  { value: "Open Sans", label: "Open Sans", type: "sans-serif" },
  { value: "custom", label: "Custom font...", type: "custom" },
] as const;

// Extract font values for preloading
const FONT_VALUES = POPULAR_FONTS.filter((f) => f.value !== "custom").map((f) => f.value);

export default function StyleStep() {
  const { style, updateStyle } = useLandfall();
  const [showCustomFont, setShowCustomFont] = useState(false);
  const [customFontInput, setCustomFontInput] = useState("");

  // Preload all Google Fonts on mount
  useEffect(() => {
    preloadGoogleFonts(FONT_VALUES);
  }, []);

  // Load the currently selected font for the preview
  const selectedFont = style?.typography.headingFont || "Inter";
  useGoogleFont(selectedFont);

  const handleColorChange = (key: string, value: string) => {
    if (style) {
      updateStyle({
        colors: { ...style.colors, [key]: value },
      });
    }
  };

  const handlePaletteSelect = (paletteId: string) => {
    const palette = COLOR_PALETTES.find((p) => p.id === paletteId);
    if (palette && style) {
      updateStyle({
        colors: {
          ...style.colors,
          primary: palette.colors.primary,
          background: palette.colors.background,
          text: palette.colors.text,
          textMuted: palette.colors.textMuted,
        },
      });
    }
  };

  const toggleKeyword = (keyword: string) => {
    if (style) {
      const isSelected = style.styleKeywords.includes(keyword);
      if (isSelected) {
        // Always allow deselecting
        const keywords = style.styleKeywords.filter((k) => k !== keyword);
        updateStyle({ styleKeywords: keywords });
      } else if (style.styleKeywords.length < MAX_KEYWORDS) {
        // Only add if under the limit
        const keywords = [...style.styleKeywords, keyword];
        updateStyle({ styleKeywords: keywords });
      }
    }
  };

  const handleBorderRadiusChange = (value: string) => {
    if (style) {
      updateStyle({ borderRadius: value as typeof style.borderRadius });
    }
  };

  const handleShadowChange = (value: string) => {
    if (style) {
      updateStyle({ shadows: value as typeof style.shadows });
    }
  };

  const handleFontChange = (value: string) => {
    if (value === "custom") {
      setShowCustomFont(true);
    } else {
      setShowCustomFont(false);
      if (style) {
        updateStyle({
          typography: { ...style.typography, headingFont: value, bodyFont: value },
        });
      }
    }
  };

  const handleCustomFontSubmit = () => {
    if (customFontInput.trim() && style) {
      updateStyle({
        typography: { ...style.typography, headingFont: customFontInput.trim(), bodyFont: customFontInput.trim() },
      });
      setShowCustomFont(false);
    }
  };

  const handleInspirationsUpdate = (inspirations: Inspiration[]) => {
    if (style) {
      updateStyle({ inspirations });
    }
  };

  if (!style) return null;

  const currentFont = POPULAR_FONTS.find((f) => f.value === style.typography.headingFont);
  const isCustomFont = !currentFont && style.typography.headingFont;

  return (
    <OnboardingShell
      stepIndex={1}
      title="Define your style"
      description="Set the visual identity for your landing page. Choose colors, typography, and overall aesthetic."
      preview={<StylePreview style={style} />}
    >
      {/* Color Palette - With Modal */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Paintbrush className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base font-medium">Color Palette</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Pick a preset palette or customize individual colors below
        </p>

        {/* Pick a Preset Button - Opens Modal */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-12 justify-start gap-3">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <span>Pick a preset palette</span>
              <div className="ml-auto flex gap-1">
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: style.colors.primary }} />
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: style.colors.background }} />
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: style.colors.text }} />
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Choose a Color Palette</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              {/* Group palettes by category */}
              {["Light", "Dark", "Warm", "Cool"].map((category) => {
                const categoryPalettes = COLOR_PALETTES.filter(p => p.category === category);
                if (categoryPalettes.length === 0) return null;
                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">{category} Themes</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {categoryPalettes.map((palette) => {
                        const isSelected =
                          style.colors.primary === palette.colors.primary &&
                          style.colors.background === palette.colors.background;
                        return (
                          <button
                            key={palette.id}
                            onClick={() => handlePaletteSelect(palette.id)}
                            className={cn(
                              "p-3 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-md",
                              "flex flex-col items-center gap-2",
                              isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
                            )}
                            title={palette.name}
                          >
                            <div className="flex gap-0.5 w-full">
                              <div
                                className="h-8 flex-1 rounded-l-sm"
                                style={{ backgroundColor: palette.colors.background }}
                              />
                              <div
                                className="h-8 flex-1"
                                style={{ backgroundColor: palette.colors.primary }}
                              />
                              <div
                                className="h-8 flex-1"
                                style={{ backgroundColor: palette.colors.text }}
                              />
                              <div
                                className="h-8 flex-1 rounded-r-sm"
                                style={{ backgroundColor: palette.colors.textMuted }}
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isSelected && <Check className="h-3 w-3 text-primary" />}
                              <span className={cn("text-xs", isSelected ? "text-primary font-medium" : "text-muted-foreground")}>
                                {palette.name}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Individual Color Fields */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {COLOR_FIELDS.map(({ key, label, description }) => {
            const currentColor = style.colors[key as keyof typeof style.colors];
            return (
              <Popover key={key}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-3 p-3 rounded-xl border-2 border-border hover:border-primary/50 transition-all text-left w-full group">
                    <div
                      className="w-10 h-10 rounded-lg shadow-inner flex-shrink-0 ring-1 ring-black/5"
                      style={{ backgroundColor: currentColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground truncate">{description}</div>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                      {currentColor}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" align="start">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{label}</Label>
                      <span className="text-xs font-mono text-muted-foreground">{currentColor}</span>
                    </div>

                    {/* Color picker with HSL controls */}
                    <ColorPicker
                      value={currentColor}
                      onChange={(color) => handleColorChange(key, color)}
                      presets={
                        key === "primary"
                          ? ["#6366f1", "#0ea5e9", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#f43f5e"]
                          : key === "background"
                          ? ["#ffffff", "#fafafa", "#f8fafc", "#f0f9ff", "#fdf2f8", "#0f172a", "#18181b", "#0a0a0a"]
                          : key === "text"
                          ? ["#0f172a", "#1e293b", "#18181b", "#171717", "#f8fafc", "#fafafa", "#ffffff", "#e2e8f0"]
                          : ["#64748b", "#6b7280", "#71717a", "#737373", "#94a3b8", "#9ca3af", "#a1a1aa", "#a3a3a3"]
                      }
                    />

                    {/* Hex input */}
                    <Input
                      value={currentColor}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="h-9 text-sm font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </div>

      {/* Style Keywords - Limited to 3 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Style Keywords</Label>
          </div>
          <span className="text-sm text-muted-foreground">
            {style.styleKeywords.length}/{MAX_KEYWORDS} selected
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Select up to {MAX_KEYWORDS} keywords that best describe your desired look
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLE_KEYWORDS.map((keyword) => {
            const isSelected = style.styleKeywords.includes(keyword);
            const isDisabled = !isSelected && style.styleKeywords.length >= MAX_KEYWORDS;
            return (
              <Badge
                key={keyword}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all px-3 py-1.5",
                  isSelected
                    ? "bg-primary hover:bg-primary/90"
                    : isDisabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-muted"
                )}
                onClick={() => !isDisabled && toggleKeyword(keyword)}
              >
                {keyword}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Inspiration Images Upload */}
      <InspirationUploader
        inspirations={style.inspirations || []}
        onUpdate={handleInspirationsUpdate}
        title="Inspiration"
        description="Upload screenshots or add URLs of designs you like. Include notes about what appeals to you."
        uploadCategory="style-inspirations"
      />

      {/* Typography - Single font with dropdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base font-medium">Font</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Most landing pages use a single font throughout for consistency
        </p>
        <div className="space-y-3">
          <Select
            value={isCustomFont ? "custom" : style.typography.headingFont}
            onValueChange={handleFontChange}
          >
            <SelectTrigger
              className="w-full"
              style={{
                fontFamily: style.typography.headingFont
                  ? `"${style.typography.headingFont}", sans-serif`
                  : undefined,
              }}
            >
              <SelectValue placeholder="Select a font">
                {isCustomFont ? style.typography.headingFont : currentFont?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {POPULAR_FONTS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span
                    style={{
                      fontFamily:
                        font.value !== "custom" ? `"${font.value}", sans-serif` : undefined,
                    }}
                  >
                    {font.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showCustomFont && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter font name (e.g., Playfair Display)"
                value={customFontInput}
                onChange={(e) => setCustomFontInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomFontSubmit()}
              />
              <Button onClick={handleCustomFontSubmit} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Square className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base font-medium">Border Radius</Label>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {BORDER_RADIUS_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleBorderRadiusChange(option.id)}
              className={cn(
                "p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2",
                style.borderRadius === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div
                className={cn("w-8 h-8 bg-primary", option.preview)}
              />
              <span className="text-xs">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shadows */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base font-medium">Shadows</Label>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {SHADOW_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleShadowChange(option.id)}
              className={cn(
                "p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2",
                style.shadows === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 bg-white rounded-lg",
                  option.id === "none" && "shadow-none",
                  option.id === "subtle" && "shadow-sm",
                  option.id === "medium" && "shadow-md",
                  option.id === "dramatic" && "shadow-xl"
                )}
              />
              <span className="text-xs">{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </OnboardingShell>
  );
}

// SpaceX-inspired preview component
function StylePreview({ style }: { style: NonNullable<ReturnType<typeof useLandfall>["style"]> }) {
  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border">
        {/* Browser Chrome */}
        <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-background rounded-md px-4 py-1.5 text-xs text-muted-foreground w-64 text-center">
              starship-launches.com
            </div>
          </div>
        </div>

        {/* Preview Content - SpaceX inspired */}
        <div
          className="p-8 min-h-[550px]"
          style={{
            backgroundColor: style.colors.background,
            fontFamily: `"${style.typography.headingFont}", sans-serif`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <Rocket
                className="h-6 w-6"
                style={{ color: style.colors.primary }}
              />
              <span
                className={cn(
                  "text-lg font-bold tracking-tight",
                  style.borderRadius === "sharp" && "rounded-none",
                  style.borderRadius === "slightly-rounded" && "rounded-sm",
                  style.borderRadius === "rounded" && "rounded-lg",
                  style.borderRadius === "pill" && "rounded-full"
                )}
                style={{ color: style.colors.text }}
              >
                STARSHIP
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span
                className="text-sm font-medium"
                style={{ color: style.colors.textMuted }}
              >
                Missions
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: style.colors.textMuted }}
              >
                Technology
              </span>
              <button
                className={cn(
                  "px-5 py-2.5 text-sm font-semibold text-white",
                  style.borderRadius === "sharp" && "rounded-none",
                  style.borderRadius === "slightly-rounded" && "rounded-sm",
                  style.borderRadius === "rounded" && "rounded-lg",
                  style.borderRadius === "pill" && "rounded-full",
                  style.shadows === "none" && "shadow-none",
                  style.shadows === "subtle" && "shadow-sm",
                  style.shadows === "medium" && "shadow-md",
                  style.shadows === "dramatic" && "shadow-lg"
                )}
                style={{ backgroundColor: style.colors.primary }}
              >
                Watch Launch
              </button>
            </div>
          </div>

          {/* Hero - SpaceX style */}
          <div className="text-center max-w-xl mx-auto mb-16">
            <p
              className="text-sm font-semibold tracking-widest mb-4 uppercase"
              style={{ color: style.colors.primary }}
            >
              Next Launch: December 28
            </p>
            <h1
              className="text-4xl font-bold tracking-tight mb-6 leading-tight"
              style={{ color: style.colors.text }}
            >
              Making humanity
              <br />
              multiplanetary
            </h1>
            <p
              className="text-lg mb-8 leading-relaxed"
              style={{ color: style.colors.textMuted }}
            >
              Starship is the world&apos;s most powerful launch vehicle ever developed,
              capable of carrying up to 150 metric tonnes to orbit.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className={cn(
                  "px-8 py-3 font-semibold text-white",
                  style.borderRadius === "sharp" && "rounded-none",
                  style.borderRadius === "slightly-rounded" && "rounded-sm",
                  style.borderRadius === "rounded" && "rounded-lg",
                  style.borderRadius === "pill" && "rounded-full",
                  style.shadows === "none" && "shadow-none",
                  style.shadows === "subtle" && "shadow-sm",
                  style.shadows === "medium" && "shadow-md",
                  style.shadows === "dramatic" && "shadow-lg"
                )}
                style={{ backgroundColor: style.colors.primary }}
              >
                Reserve Your Seat
              </button>
              <button
                className={cn(
                  "px-8 py-3 font-semibold border-2",
                  style.borderRadius === "sharp" && "rounded-none",
                  style.borderRadius === "slightly-rounded" && "rounded-sm",
                  style.borderRadius === "rounded" && "rounded-lg",
                  style.borderRadius === "pill" && "rounded-full"
                )}
                style={{
                  color: style.colors.text,
                  borderColor: style.colors.primary,
                }}
              >
                Watch Webcast
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div
            className={cn(
              "grid grid-cols-3 gap-4 p-6",
              style.borderRadius === "sharp" && "rounded-none",
              style.borderRadius === "slightly-rounded" && "rounded-sm",
              style.borderRadius === "rounded" && "rounded-xl",
              style.borderRadius === "pill" && "rounded-2xl",
              style.shadows === "none" && "shadow-none border",
              style.shadows === "subtle" && "shadow-sm",
              style.shadows === "medium" && "shadow-md",
              style.shadows === "dramatic" && "shadow-lg"
            )}
            style={{
              backgroundColor: style.colors.background,
              borderColor: style.colors.textMuted + "20",
            }}
          >
            {[
              { value: "400+", label: "Successful Launches" },
              { value: "150t", label: "Payload Capacity" },
              { value: "9m", label: "Diameter" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: style.colors.primary }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: style.colors.textMuted }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
