"use client";

import React, { useState } from "react";
import { OnboardingShell } from "@/components/layout/OnboardingShell";
import { useLandfall } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  Copy,
  Download,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BuildPrompt, SECTION_TYPES } from "@/lib/types";

export default function BuildStep() {
  const { sitemap, style, tone, navigation, pages } = useLandfall();
  const [prompts, setPrompts] = useState<BuildPrompt[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState<number | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);

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
    <OnboardingShell
      stepIndex={7}
      title="Generate your prompts"
      description="Review your specification and generate AI-ready prompts for your landing page."
      nextLabel="Done"
      preview={<BuildPreview prompts={prompts} />}
    >
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-muted/50 rounded-xl text-center">
          <div className="text-2xl font-bold">{sitemap?.pages?.length || 0}</div>
          <div className="text-sm text-muted-foreground">Pages</div>
        </div>
        <div className="p-4 bg-muted/50 rounded-xl text-center">
          <div className="text-2xl font-bold">{totalSections}</div>
          <div className="text-sm text-muted-foreground">Sections</div>
        </div>
        <div className="p-4 bg-muted/50 rounded-xl text-center">
          <div className="text-2xl font-bold">
            {prompts.length || totalSections + 2}
          </div>
          <div className="text-sm text-muted-foreground">Prompts</div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
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

      {/* Generate Button */}
      {prompts.length === 0 ? (
        <Button
          onClick={generatePrompts}
          disabled={isGenerating}
          className="w-full h-14 text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Prompts
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyAllPrompts} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
            <Button variant="outline" onClick={downloadMarkdown} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
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

          {/* Prompt List */}
          <div className="space-y-2">
            {prompts.map((prompt) => (
              <div
                key={prompt.step}
                className="border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedPrompt(
                      expandedPrompt === prompt.step ? null : prompt.step
                    )
                  }
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  <Badge
                    variant="outline"
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    {prompt.step}
                  </Badge>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{prompt.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {prompt.description}
                    </div>
                  </div>
                  {expandedPrompt === prompt.step ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {expandedPrompt === prompt.step && (
                  <div className="border-t p-4 bg-muted/30">
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPrompt(prompt)}
                      >
                        {copiedPrompt === prompt.step ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap bg-background p-4 rounded-lg border overflow-auto max-h-80">
                      {prompt.prompt}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </OnboardingShell>
  );
}

function BuildPreview({ prompts }: { prompts: BuildPrompt[] }) {
  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border">
        <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-background rounded-md px-4 py-1.5 text-xs text-muted-foreground">
              Build Sequence
            </div>
          </div>
        </div>

        <div className="p-6 min-h-[500px]">
          {prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg mb-2">Ready to Generate</h3>
              <p className="text-muted-foreground max-w-sm">
                Click &quot;Generate Prompts&quot; to create a sequence of
                AI-ready prompts for your landing page.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-4">
                {prompts.length} prompts generated. Copy them one by one into your
                AI coding tool.
              </div>

              {prompts.map((prompt, index) => (
                <div
                  key={prompt.step}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {prompt.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {prompt.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {prompt.description}
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge className="bg-primary/10 text-primary border-0">
                      Start here
                    </Badge>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t mt-6">
                <div className="text-sm text-muted-foreground">
                  <strong>How to use:</strong>
                  <ol className="mt-2 space-y-1 list-decimal list-inside">
                    <li>Copy the first prompt</li>
                    <li>Paste it into your AI coding tool</li>
                    <li>Wait for the AI to complete the task</li>
                    <li>Move to the next prompt</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
