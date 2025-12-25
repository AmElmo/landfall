"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  // Handle invalid hex
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return { h: 0, s: 0, l: 0 };
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  presets,
  className,
}: ColorPickerProps) {
  const [hsl, setHsl] = React.useState(() => hexToHSL(value));
  const saturationRef = React.useRef<HTMLDivElement>(null);
  const hueRef = React.useRef<HTMLDivElement>(null);

  // Update HSL when value changes externally
  React.useEffect(() => {
    const newHsl = hexToHSL(value);
    // Only update if the hex values differ significantly
    const currentHex = hslToHex(hsl.h, hsl.s, hsl.l);
    if (currentHex.toLowerCase() !== value.toLowerCase()) {
      setHsl(newHsl);
    }
  }, [value]);

  const updateColor = (newHsl: { h: number; s: number; l: number }) => {
    setHsl(newHsl);
    onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l));
  };

  // Handle saturation/lightness picker
  const handleSaturationClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!saturationRef.current) return;
    const rect = saturationRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    updateColor({ ...hsl, s: Math.round(x * 100), l: Math.round((1 - y) * 50 + 25) });
  };

  const handleSaturationDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleSaturationClick(e);
  };

  // Handle hue slider
  const handleHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    updateColor({ ...hsl, h: Math.round(x * 360) });
  };

  const handleHueDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleHueClick(e);
  };

  // Calculate picker position
  const satPickerX = hsl.s;
  const satPickerY = 100 - ((hsl.l - 25) / 50) * 100;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Saturation/Lightness picker */}
      <div
        ref={saturationRef}
        className="relative h-32 rounded-lg cursor-crosshair overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, white 0%, hsl(${hsl.h}, 100%, 50%) 50%, black 100%)`,
        }}
        onClick={handleSaturationClick}
        onMouseMove={handleSaturationDrag}
      >
        {/* Saturation gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right,
              hsl(${hsl.h}, 0%, ${hsl.l}%) 0%,
              transparent 100%)`,
          }}
        />
        {/* Picker indicator */}
        <div
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{
            left: `${satPickerX}%`,
            top: `${Math.max(0, Math.min(100, satPickerY))}%`,
            backgroundColor: value,
          }}
        />
      </div>

      {/* Hue slider */}
      <div
        ref={hueRef}
        className="relative h-4 rounded-full cursor-pointer"
        style={{
          background:
            "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
        }}
        onClick={handleHueClick}
        onMouseMove={handleHueDrag}
      >
        {/* Hue picker indicator */}
        <div
          className="absolute top-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{
            left: `${(hsl.h / 360) * 100}%`,
            backgroundColor: `hsl(${hsl.h}, 100%, 50%)`,
          }}
        />
      </div>

      {/* Color presets */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={cn(
                "w-6 h-6 rounded-md ring-1 ring-black/10 transition-all hover:scale-110 hover:ring-2 hover:ring-primary/50",
                value.toLowerCase() === color.toLowerCase() && "ring-2 ring-primary"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
