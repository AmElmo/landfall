"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLandfall } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Copy,
  Download,
  Rocket,
  Play,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BuildPrompt, STEPS } from "@/lib/types";

export default function BuildStep() {
  const router = useRouter();
  const { sitemap, style, tone, pages, isSaving, setCurrentStep } = useLandfall();
  const [prompts, setPrompts] = useState<BuildPrompt[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);

  const stepIndex = 7;
  const totalSteps = STEPS.length;

  const navigateToStep = (stepId: number) => {
    const step = STEPS.find((s) => s.id === stepId);
    if (step) {
      setCurrentStep(stepId);
      router.push(`/step/${step.slug}`);
    }
  };

  const handleBack = () => {
    if (stepIndex > 1) {
      navigateToStep(stepIndex - 1);
    }
  };

  const generatePrompts = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/build", { method: "POST" });
      const data = await response.json();
      setPrompts(data.prompts || []);
      setExpandedPrompt(1); // Expand first prompt
    } catch (error) {
      console.error("Error generating prompts:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = async (prompt: BuildPrompt) => {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopiedPrompt(prompt.step);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const copyAllPrompts = async () => {
    const allText = prompts
      .map((p) => `## Step ${p.step}: ${p.name}\n\n${p.prompt}`)
      .join("\n\n---\n\n");
    await navigator.clipboard.writeText(allText);
  };

  const downloadMarkdown = () => {
    const content = prompts
      .map((p) => `# Step ${p.step}: ${p.name}\n\n${p.prompt}`)
      .join("\n\n---\n\n");

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "landfall-prompts.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Validation
  const warnings: string[] = [];
  if (!style?.styleKeywords?.length) warnings.push("No style keywords selected");
  if (!tone?.toneKeywords?.length) warnings.push("No tone keywords selected");
  if (!sitemap?.pages?.length) warnings.push("No pages defined");

  const hasContent = Object.values(pages).some((p) => p?.sections?.length > 0);
  if (!hasContent) warnings.push("No sections added to any page");

  // Stats
  const totalSections = Object.values(pages).reduce(
    (acc, p) => acc + (p?.sections?.length || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b bg-background px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            <span className="text-sm text-muted-foreground">
              {stepIndex}/{totalSteps}
            </span>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">Generate your prompts</h1>
            <p className="text-sm text-muted-foreground">
              Review your specification and generate AI-ready prompts for your landing page
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Step Progress Dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => navigateToStep(step.id)}
                  title={step.name}
                  className={cn(
                    "h-2 rounded-full transition-all hover:scale-110",
                    idx + 1 === stepIndex
                      ? "w-8 bg-primary"
                      : idx + 1 < stepIndex
                      ? "w-2 bg-primary/60 hover:bg-primary/80"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-6 bg-white rounded-xl border shadow-sm text-center">
              <div className="text-3xl font-bold text-primary">{sitemap?.pages?.length || 0}</div>
              <div className="text-sm text-muted-foreground mt-1">Pages</div>
            </div>
            <div className="p-6 bg-white rounded-xl border shadow-sm text-center">
              <div className="text-3xl font-bold text-primary">{totalSections}</div>
              <div className="text-sm text-muted-foreground mt-1">Sections</div>
            </div>
            <div className="p-6 bg-white rounded-xl border shadow-sm text-center">
              <div className="text-3xl font-bold text-primary">
                {prompts.length || totalSections + 2}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Prompts</div>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-8">
              <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
                <AlertCircle className="h-4 w-4" />
                Recommendations
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Generate Button or Prompts List */}
          {prompts.length === 0 ? (
            <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
              <Rocket className="h-16 w-16 mx-auto text-primary/50 mb-6" />
              <h2 className="text-2xl font-semibold mb-3">Ready to Build</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Click the button below to create a sequence of AI-ready prompts
                for building your landing page.
              </p>
              <Button
                onClick={generatePrompts}
                disabled={isGenerating}
                size="lg"
                className="h-14 px-8 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Build Prompts
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Actions Bar */}
              <div className="flex gap-3 bg-white rounded-xl border shadow-sm p-4">
                <Button variant="outline" onClick={copyAllPrompts} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Prompts
                </Button>
                <Button variant="outline" onClick={downloadMarkdown} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download as Markdown
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPrompts([]);
                    setExpandedPrompt(null);
                  }}
                >
                  Regenerate
                </Button>
              </div>

              {/* How to Use */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="text-sm">
                  <strong className="text-primary">How to use:</strong>
                  <span className="text-muted-foreground ml-2">
                    Copy each prompt in order and paste into your AI coding tool (Claude, Cursor, etc.)
                  </span>
                </div>
              </div>

              {/* Prompt List */}
              <div className="space-y-3">
                {prompts.map((prompt, index) => (
                  <div
                    key={prompt.step}
                    className="bg-white border rounded-xl overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() =>
                        setExpandedPrompt(
                          expandedPrompt === prompt.step ? null : prompt.step
                        )
                      }
                      className="w-full flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                          index === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {prompt.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-lg">{prompt.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {prompt.description}
                        </div>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-primary/10 text-primary border-0 shrink-0">
                          Start here
                        </Badge>
                      )}
                      {expandedPrompt === prompt.step ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {expandedPrompt === prompt.step && (
                      <div className="border-t p-5 bg-muted/30">
                        <div className="flex justify-end mb-3">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => copyPrompt(prompt)}
                          >
                            {copiedPrompt === prompt.step ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Prompt
                              </>
                            )}
                          </Button>
                        </div>
                        <pre className="text-sm whitespace-pre-wrap bg-background p-4 rounded-lg border overflow-auto max-h-[500px]">
                          {prompt.prompt}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
