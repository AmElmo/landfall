"use client";

import { useState, useEffect } from "react";
import type { LayoutTemplate, LayoutTemplateCategory, SectionType } from "@/lib/types";

interface UseWireframeTemplatesResult {
  templates: LayoutTemplate[];
  isLoading: boolean;
  error: string | null;
}

export function useWireframeTemplates(sectionType: SectionType | null): UseWireframeTemplatesResult {
  const [templates, setTemplates] = useState<LayoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sectionType) {
      setTemplates([]);
      return;
    }

    const fetchTemplates = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/wireframe-templates/${sectionType}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch templates for ${sectionType}`);
        }
        const data: LayoutTemplateCategory = await res.json();
        setTemplates(data.templates);
      } catch (err) {
        console.error("Error fetching wireframe templates:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [sectionType]);

  return { templates, isLoading, error };
}

export function getTemplateById(templates: LayoutTemplate[], templateId: string): LayoutTemplate | undefined {
  return templates.find(t => t.id === templateId);
}
