"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Config, Style, Tone, Sitemap, Navigation, PageSections } from "./types";

interface LandfallContextType {
  // Data
  config: Config | null;
  style: Style | null;
  tone: Tone | null;
  sitemap: Sitemap | null;
  navigation: Navigation | null;
  pages: Record<string, PageSections>;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Current step
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Actions
  updateConfig: (data: Partial<Config>) => Promise<void>;
  updateStyle: (data: Partial<Style>) => Promise<void>;
  updateTone: (data: Partial<Tone>) => Promise<void>;
  updateSitemap: (data: Partial<Sitemap>) => Promise<void>;
  updateNavigation: (data: Partial<Navigation>) => Promise<void>;
  updatePage: (pageSlug: string, data: Partial<PageSections>) => Promise<void>;

  // Refresh data
  refreshData: () => Promise<void>;
}

const LandfallContext = createContext<LandfallContextType | undefined>(undefined);

export function LandfallProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [style, setStyle] = useState<Style | null>(null);
  const [tone, setTone] = useState<Tone | null>(null);
  const [sitemap, setSitemap] = useState<Sitemap | null>(null);
  const [navigation, setNavigation] = useState<Navigation | null>(null);
  const [pages, setPages] = useState<Record<string, PageSections>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStepState] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      const [configRes, styleRes, toneRes, sitemapRes, navigationRes] = await Promise.all([
        fetch("/api/config/config"),
        fetch("/api/config/style"),
        fetch("/api/config/tone"),
        fetch("/api/config/sitemap"),
        fetch("/api/config/navigation"),
      ]);

      const [configData, styleData, toneData, sitemapData, navigationData] = await Promise.all([
        configRes.json(),
        styleRes.json(),
        toneRes.json(),
        sitemapRes.json(),
        navigationRes.json(),
      ]);

      setConfig(configData);
      setStyle(styleData);
      setTone(toneData);
      setSitemap(sitemapData);
      setNavigation(navigationData);
      setCurrentStepState(configData.currentStep || 1);

      // Fetch page data for each page in sitemap
      const pagePromises = sitemapData.pages.map(async (page: { slug: string }) => {
        const pageSlug = page.slug === "/" ? "home" : page.slug.replace(/^\//, "");
        const res = await fetch(`/api/config/pages/${pageSlug}`);
        if (res.ok) {
          return { slug: pageSlug, data: await res.json() };
        }
        return null;
      });

      const pageResults = await Promise.all(pagePromises);
      const pagesData: Record<string, PageSections> = {};
      pageResults.forEach((result) => {
        if (result) {
          pagesData[result.slug] = result.data;
        }
      });
      setPages(pagesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateData = async (filename: string, data: unknown) => {
    setIsSaving(true);
    try {
      await fetch(`/api/config/${filename}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const setCurrentStep = useCallback(async (step: number) => {
    setCurrentStepState((prevStep) => {
      if (prevStep === step) return prevStep;
      return step;
    });
  }, []);

  // Persist step changes to config - use a ref to avoid dependency on config
  const configRef = React.useRef(config);
  configRef.current = config;

  useEffect(() => {
    const currentConfig = configRef.current;
    if (currentConfig && currentConfig.currentStep !== currentStep) {
      const updatedConfig = { ...currentConfig, currentStep, updatedAt: new Date().toISOString() };
      setConfig(updatedConfig);
      updateData("config", updatedConfig);
    }
  }, [currentStep]);

  const updateConfig = async (data: Partial<Config>) => {
    if (config) {
      const updated = { ...config, ...data, updatedAt: new Date().toISOString() };
      setConfig(updated);
      await updateData("config", updated);
    }
  };

  const updateStyle = async (data: Partial<Style>) => {
    if (style) {
      const updated = { ...style, ...data };
      setStyle(updated);
      await updateData("style", updated);
    }
  };

  const updateTone = async (data: Partial<Tone>) => {
    if (tone) {
      const updated = { ...tone, ...data };
      setTone(updated);
      await updateData("tone", updated);
    }
  };

  const updateSitemap = async (data: Partial<Sitemap>) => {
    if (sitemap) {
      const updated = { ...sitemap, ...data };
      setSitemap(updated);
      await updateData("sitemap", updated);
    }
  };

  const updateNavigation = async (data: Partial<Navigation>) => {
    if (navigation) {
      const updated = { ...navigation, ...data };
      setNavigation(updated);
      await updateData("navigation", updated);
    }
  };

  const updatePage = async (pageSlug: string, data: Partial<PageSections>) => {
    // Create a new page with empty sections if it doesn't exist yet
    const currentPage = pages[pageSlug] || { sections: [] };
    const updated = { ...currentPage, ...data };
    setPages((prev) => ({ ...prev, [pageSlug]: updated }));
    await fetch(`/api/config/pages/${pageSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  return (
    <LandfallContext.Provider
      value={{
        config,
        style,
        tone,
        sitemap,
        navigation,
        pages,
        isLoading,
        isSaving,
        currentStep,
        setCurrentStep,
        updateConfig,
        updateStyle,
        updateTone,
        updateSitemap,
        updateNavigation,
        updatePage,
        refreshData: fetchData,
      }}
    >
      {children}
    </LandfallContext.Provider>
  );
}

export function useLandfall() {
  const context = useContext(LandfallContext);
  if (context === undefined) {
    throw new Error("useLandfall must be used within a LandfallProvider");
  }
  return context;
}
