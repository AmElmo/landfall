"use client";

import { useEffect, useState } from "react";

// Track which fonts have been loaded to avoid duplicate loading
const loadedFonts = new Set<string>();

export function useGoogleFont(fontName: string | null) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!fontName || fontName === "custom") {
      setIsLoaded(true);
      return;
    }

    // Check if already loaded
    if (loadedFonts.has(fontName)) {
      setIsLoaded(true);
      return;
    }

    // Create link element for Google Font
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
    link.rel = "stylesheet";

    link.onload = () => {
      loadedFonts.add(fontName);
      setIsLoaded(true);
    };

    document.head.appendChild(link);

    return () => {
      // Don't remove the link on cleanup to keep fonts cached
    };
  }, [fontName]);

  return isLoaded;
}

export function useGoogleFonts(fontNames: string[]) {
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let loaded = 0;

    fontNames.forEach((fontName) => {
      if (!fontName || fontName === "custom") {
        loaded++;
        return;
      }

      if (loadedFonts.has(fontName)) {
        loaded++;
        return;
      }

      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
      link.rel = "stylesheet";

      link.onload = () => {
        loadedFonts.add(fontName);
        setLoadedCount((prev) => prev + 1);
      };

      document.head.appendChild(link);
    });

    setLoadedCount(loaded);
  }, [fontNames]);

  return loadedCount === fontNames.length;
}

// Pre-load all fonts for the selector
export function preloadGoogleFonts(fontNames: string[]) {
  fontNames.forEach((fontName) => {
    if (!fontName || fontName === "custom" || loadedFonts.has(fontName)) {
      return;
    }

    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
    link.rel = "stylesheet";

    link.onload = () => {
      loadedFonts.add(fontName);
    };

    document.head.appendChild(link);
  });
}
