"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LandfallProvider, useLandfall } from "@/lib/context";
import { STEPS } from "@/lib/types";
import { Loader2 } from "lucide-react";

// Step Components
import StyleStep from "@/components/steps/StyleStep";
import ToneStep from "@/components/steps/ToneStep";
import SitemapStep from "@/components/steps/SitemapStep";
import NavigationStep from "@/components/steps/NavigationStep";
import SectionsStep from "@/components/steps/SectionsStep";
import CopyVisualsStep from "@/components/steps/CopyVisualsStep";
import PreviewStep from "@/components/steps/PreviewStep";
import BuildStep from "@/components/steps/BuildStep";

const stepComponents: Record<string, React.ComponentType> = {
  style: StyleStep,
  tone: ToneStep,
  sitemap: SitemapStep,
  sections: SectionsStep,
  'copy-visuals': CopyVisualsStep,
  navigation: NavigationStep,
  preview: PreviewStep,
  build: BuildStep,
};

function StepContent() {
  const params = useParams();
  const router = useRouter();
  const { isLoading, currentStep, setCurrentStep } = useLandfall();
  const slug = params.slug as string;

  // Find the step by slug
  const step = STEPS.find((s) => s.slug === slug);

  // Sync URL step with context only when they differ
  useEffect(() => {
    if (step && currentStep !== step.id) {
      setCurrentStep(step.id);
    }
  }, [step?.id]); // Only depend on step.id to avoid re-running

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your project...</p>
        </div>
      </div>
    );
  }

  // Redirect to style if invalid slug
  if (!step) {
    router.replace("/step/style");
    return null;
  }

  const StepComponent = stepComponents[slug] || StyleStep;

  return <StepComponent />;
}

export default function StepPage() {
  return (
    <LandfallProvider>
      <StepContent />
    </LandfallProvider>
  );
}
