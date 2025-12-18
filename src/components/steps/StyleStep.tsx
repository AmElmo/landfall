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
import { Paintbrush, Type, Square, Sun, Plus, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { InspirationUploader, Inspiration } from "@/components/shared/InspirationUploader";
import { preloadGoogleFonts, useGoogleFont } from "@/hooks/useGoogleFonts";

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

// Predefined color palettes
const COLOR_PALETTES = [
  {
    id: "midnight",
    name: "Midnight",
    colors: { primary: "#6366f1", background: "#0f172a", text: "#f8fafc", textMuted: "#94a3b8" },
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: { primary: "#0ea5e9", background: "#ffffff", text: "#0f172a", textMuted: "#64748b" },
  },
  {
    id: "forest",
    name: "Forest",
    colors: { primary: "#22c55e", background: "#fafaf9", text: "#1c1917", textMuted: "#78716c" },
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: { primary: "#f97316", background: "#fffbeb", text: "#292524", textMuted: "#78716c" },
  },
  {
    id: "berry",
    name: "Berry",
    colors: { primary: "#ec4899", background: "#fdf2f8", text: "#1f2937", textMuted: "#6b7280" },
  },
  {
    id: "slate",
    name: "Slate",
    colors: { primary: "#475569", background: "#f8fafc", text: "#0f172a", textMuted: "#64748b" },
  },
  {
    id: "lavender",
    name: "Lavender",
    colors: { primary: "#8b5cf6", background: "#faf5ff", text: "#1e1b4b", textMuted: "#6b7280" },
  },
  {
    id: "coral",
    name: "Coral",
    colors: { primary: "#f43f5e", background: "#ffffff", text: "#18181b", textMuted: "#71717a" },
  },
  {
    id: "teal",
    name: "Teal",
    colors: { primary: "#14b8a6", background: "#f0fdfa", text: "#134e4a", textMuted: "#5eead4" },
  },
  {
    id: "amber",
    name: "Amber",
    colors: { primary: "#f59e0b", background: "#1c1917", text: "#fef3c7", textMuted: "#a8a29e" },
  },
  {
    id: "rose",
    name: "Rose",
    colors: { primary: "#e11d48", background: "#0c0a09", text: "#fafaf9", textMuted: "#a8a29e" },
  },
  {
    id: "emerald",
    name: "Emerald",
    colors: { primary: "#10b981", background: "#18181b", text: "#f4f4f5", textMuted: "#a1a1aa" },
  },
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
      {/* Color Palette - Simplified */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Paintbrush className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base font-medium">Color Palette</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Pick a preset palette or customize individual colors below
        </p>

        {/* Preset Palettes */}
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PALETTES.map((palette) => (
            <button
              key={palette.id}
              onClick={() => handlePaletteSelect(palette.id)}
              className={cn(
                "p-2 rounded-lg border-2 transition-all hover:scale-105",
                "flex flex-col items-center gap-1.5"
              )}
              title={palette.name}
            >
              <div className="flex gap-0.5 w-full">
                <div
                  className="h-6 flex-1 rounded-l-sm"
                  style={{ backgroundColor: palette.colors.background }}
                />
                <div
                  className="h-6 flex-1"
                  style={{ backgroundColor: palette.colors.primary }}
                />
                <div
                  className="h-6 flex-1"
                  style={{ backgroundColor: palette.colors.text }}
                />
                <div
                  className="h-6 flex-1 rounded-r-sm"
                  style={{ backgroundColor: palette.colors.textMuted }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{palette.name}</span>
            </button>
          ))}
        </div>

        {/* Individual Color Fields */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {COLOR_FIELDS.map(({ key, label, description }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 cursor-pointer flex-shrink-0 relative overflow-hidden shadow-sm"
                  style={{ backgroundColor: style.colors[key as keyof typeof style.colors] }}
                >
                  <input
                    type="color"
                    value={style.colors[key as keyof typeof style.colors]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium">{label}</Label>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <Input
                value={style.colors[key as keyof typeof style.colors]}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="h-9 text-xs font-mono"
                placeholder="#000000"
              />
            </div>
          ))}
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

          {/* Keywords display */}
          {style.styleKeywords.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              {style.styleKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className={cn(
                    "px-3 py-1 text-xs font-medium border",
                    style.borderRadius === "sharp" && "rounded-none",
                    style.borderRadius === "slightly-rounded" && "rounded-sm",
                    style.borderRadius === "rounded" && "rounded-md",
                    style.borderRadius === "pill" && "rounded-full"
                  )}
                  style={{
                    borderColor: style.colors.primary,
                    color: style.colors.primary,
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
