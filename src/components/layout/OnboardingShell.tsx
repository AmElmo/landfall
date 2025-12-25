"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { STEPS } from "@/lib/types";
import { useLandfall } from "@/lib/context";
import {
  ArrowLeft,
  Check,
  Loader2,
  Palette,
  MessageSquare,
  Map,
  Layers,
  Menu,
  Eye,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Map step slugs to icons
const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  style: Palette,
  tone: MessageSquare,
  sitemap: Map,
  sections: Layers,
  navigation: Menu,
  preview: Eye,
  build: Wand2,
};

interface OnboardingShellProps {
  children: React.ReactNode;
  preview?: React.ReactNode;
  stepIndex: number;
  title: string;
  description?: string;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  showSkip?: boolean;
  onSkip?: () => void;
  /** Use wider preview panel (narrower left panel) */
  widePreview?: boolean;
  /** Hide the preview panel entirely and use full width for content */
  noPreview?: boolean;
}

export function OnboardingShell({
  children,
  preview,
  stepIndex,
  title,
  description,
  onNext,
  onBack,
  nextLabel = "Continue",
  showSkip = false,
  onSkip,
  widePreview = false,
  noPreview = false,
}: OnboardingShellProps) {
  const router = useRouter();
  const { isSaving, setCurrentStep } = useLandfall();
  const totalSteps = STEPS.length;

  const navigateToStep = (stepId: number) => {
    const step = STEPS.find((s) => s.id === stepId);
    if (step) {
      setCurrentStep(stepId);
      router.push(`/step/${step.slug}`);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (stepIndex > 1) {
      navigateToStep(stepIndex - 1);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
    if (stepIndex < totalSteps) {
      navigateToStep(stepIndex + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Top Navigation Bar - Full Width */}
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <div className="flex items-center gap-3 min-w-[100px]">
            {stepIndex > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          {/* Step Progress Icons */}
          <div className="flex items-center">
            {STEPS.map((step, idx) => {
              const StepIcon = STEP_ICONS[step.slug];
              const isActive = idx + 1 === stepIndex;
              const isCompleted = idx + 1 < stepIndex;
              const isLast = idx === STEPS.length - 1;

              return (
                <React.Fragment key={step.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => navigateToStep(step.id)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/50",
                          isActive
                            ? "bg-primary text-primary-foreground scale-110 shadow-md"
                            : isCompleted
                            ? "bg-primary/20 text-primary hover:bg-primary/30"
                            : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                        )}
                      >
                        {StepIcon && <StepIcon className="h-4 w-4" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8}>
                      <span className="font-medium">{step.name}</span>
                      <span className="ml-1.5 text-muted-foreground">({idx + 1}/{STEPS.length})</span>
                    </TooltipContent>
                  </Tooltip>
                  {/* Connector line between steps */}
                  {!isLast && (
                    <div
                      className={cn(
                        "w-6 h-0.5 mx-1",
                        idx + 1 < stepIndex
                          ? "bg-primary/40"
                          : "bg-muted"
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 min-w-[100px] justify-end">
            {showSkip && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip || handleNext}
                className="text-muted-foreground"
              >
                Skip
              </Button>
            )}
            <Button size="sm" onClick={handleNext} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                nextLabel
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Panel - Form */}
        <div className={cn(
          "w-full flex flex-col",
          !noPreview && (widePreview ? "lg:w-[35%] xl:w-[30%]" : "lg:w-1/2 xl:w-[45%]")
        )}>
          <div className="flex-1 overflow-auto outline-none focus:outline-none" tabIndex={-1}>
            <div className={cn("mx-auto px-8 py-8", noPreview ? "max-w-3xl" : "max-w-xl")}>
              {/* Title & Description */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-muted-foreground font-medium">
                    Step {stepIndex} of {totalSteps}
                  </span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight mb-2">{title}</h1>
                {description && (
                  <p className="text-muted-foreground">{description}</p>
                )}
              </div>

              {/* Form Content */}
              <div className="space-y-6">{children}</div>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        {!noPreview && (
          <div className={cn(
            "hidden lg:block bg-muted/30 border-l",
            widePreview ? "lg:w-[65%] xl:w-[70%]" : "lg:w-1/2 xl:w-[55%]"
          )}>
            <div className="sticky top-[57px] h-[calc(100vh-57px)] overflow-auto p-4 flex flex-col outline-none focus:outline-none" tabIndex={-1}>
              <div className="flex-1 flex items-start justify-center">
                {preview || <PreviewPlaceholder stepIndex={stepIndex} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewPlaceholder({ stepIndex }: { stepIndex: number }) {
  const step = STEPS[stepIndex - 1];

  return (
    <div className="w-full max-w-2xl">
      {/* Mock Browser Window */}
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
              your-landing-page.com
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6 min-h-[500px] bg-gradient-to-b from-muted/20 to-background">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded bg-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {step?.name || "Preview"}
            </span>
          </div>

          {/* Skeleton Preview based on step */}
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted/60 rounded w-1/2" />
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-24 bg-muted/40 rounded-lg" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted/60 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Card Component for selection UIs
interface StepCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
}

export function StepCard({ icon, title, description, selected, onClick }: StepCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl border-2 text-left transition-all",
        "hover:border-primary/50 hover:bg-primary/5",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border bg-background"
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            selected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium">{title}</div>
          {description && (
            <div className="text-sm text-muted-foreground mt-0.5">{description}</div>
          )}
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  );
}
