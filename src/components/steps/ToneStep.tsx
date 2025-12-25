"use client";

import React from "react";
import { OnboardingShell } from "@/components/layout/OnboardingShell";
import { useLandfall } from "@/lib/context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus, MessageSquare, Users, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { InspirationUploader, Inspiration } from "@/components/shared/InspirationUploader";

const TONE_KEYWORDS = [
  "Professional",
  "Casual",
  "Friendly",
  "Authoritative",
  "Playful",
  "Technical",
  "Inspiring",
  "Direct",
  "Warm",
  "Confident",
  "Conversational",
  "Formal",
];

const PERSONALITY_SUGGESTIONS = [
  "Innovative",
  "Trustworthy",
  "Approachable",
  "Expert",
  "Bold",
  "Reliable",
  "Creative",
  "Helpful",
];

const MAX_TONE_KEYWORDS = 3;
const MAX_PERSONALITY = 3;

export default function ToneStep() {
  const { tone, updateTone } = useLandfall();
  const [newDoItem, setNewDoItem] = React.useState("");
  const [newDontItem, setNewDontItem] = React.useState("");
  const [newPhrase, setNewPhrase] = React.useState("");

  const toggleKeyword = (keyword: string) => {
    if (tone) {
      const isSelected = tone.toneKeywords.includes(keyword);
      if (isSelected) {
        // Always allow deselecting
        const keywords = tone.toneKeywords.filter((k) => k !== keyword);
        updateTone({ toneKeywords: keywords });
      } else if (tone.toneKeywords.length < MAX_TONE_KEYWORDS) {
        // Only add if under the limit
        const keywords = [...tone.toneKeywords, keyword];
        updateTone({ toneKeywords: keywords });
      }
    }
  };

  const togglePersonality = (trait: string) => {
    if (tone) {
      const isSelected = tone.brandPersonality.includes(trait);
      if (isSelected) {
        // Always allow deselecting
        const personality = tone.brandPersonality.filter((p) => p !== trait);
        updateTone({ brandPersonality: personality });
      } else if (tone.brandPersonality.length < MAX_PERSONALITY) {
        // Only add if under the limit
        const personality = [...tone.brandPersonality, trait];
        updateTone({ brandPersonality: personality });
      }
    }
  };

  const addDoItem = () => {
    if (tone && newDoItem.trim()) {
      updateTone({
        guidelines: {
          ...tone.guidelines,
          do: [...tone.guidelines.do, newDoItem.trim()],
        },
      });
      setNewDoItem("");
    }
  };

  const removeDoItem = (index: number) => {
    if (tone) {
      updateTone({
        guidelines: {
          ...tone.guidelines,
          do: tone.guidelines.do.filter((_, i) => i !== index),
        },
      });
    }
  };

  const addDontItem = () => {
    if (tone && newDontItem.trim()) {
      updateTone({
        guidelines: {
          ...tone.guidelines,
          dont: [...tone.guidelines.dont, newDontItem.trim()],
        },
      });
      setNewDontItem("");
    }
  };

  const removeDontItem = (index: number) => {
    if (tone) {
      updateTone({
        guidelines: {
          ...tone.guidelines,
          dont: tone.guidelines.dont.filter((_, i) => i !== index),
        },
      });
    }
  };

  const addPhrase = () => {
    if (tone && newPhrase.trim()) {
      updateTone({
        examplePhrases: [...tone.examplePhrases, newPhrase.trim()],
      });
      setNewPhrase("");
    }
  };

  const removePhrase = (index: number) => {
    if (tone) {
      updateTone({
        examplePhrases: tone.examplePhrases.filter((_, i) => i !== index),
      });
    }
  };

  const handleInspirationsUpdate = (inspirations: Inspiration[]) => {
    if (tone) {
      updateTone({ inspirations });
    }
  };

  if (!tone) return null;

  return (
    <OnboardingShell
      stepIndex={2}
      title="Set your tone of voice"
      description="Define how your copy should sound. This helps the AI write content that matches your brand personality."
      noPreview
    >
      {/* Tone Keywords */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Tone Keywords</Label>
          </div>
          <span className="text-sm text-muted-foreground">
            {tone.toneKeywords.length}/{MAX_TONE_KEYWORDS} selected
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Select up to {MAX_TONE_KEYWORDS} keywords that describe how your copy should sound
        </p>
        <div className="flex flex-wrap gap-2">
          {TONE_KEYWORDS.map((keyword) => {
            const isSelected = tone.toneKeywords.includes(keyword);
            const isDisabled = !isSelected && tone.toneKeywords.length >= MAX_TONE_KEYWORDS;
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

      {/* Brand Personality */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-medium">Brand Personality</Label>
          </div>
          <span className="text-sm text-muted-foreground">
            {tone.brandPersonality.length}/{MAX_PERSONALITY} selected
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Select up to {MAX_PERSONALITY} adjectives that describe your brand
        </p>
        <div className="flex flex-wrap gap-2">
          {PERSONALITY_SUGGESTIONS.map((trait) => {
            const isSelected = tone.brandPersonality.includes(trait);
            const isDisabled = !isSelected && tone.brandPersonality.length >= MAX_PERSONALITY;
            return (
              <Badge
                key={trait}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all px-3 py-1.5",
                  isSelected
                    ? "bg-primary hover:bg-primary/90"
                    : isDisabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-muted"
                )}
                onClick={() => !isDisabled && togglePersonality(trait)}
              >
                {trait}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Target Audience */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Target Audience</Label>
        <Textarea
          value={tone.targetAudience}
          onChange={(e) => updateTone({ targetAudience: e.target.value })}
          placeholder="e.g., Technical founders and developers building SaaS products"
          className="min-h-[80px]"
        />
      </div>

      {/* Do's */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ThumbsUp className="h-4 w-4 text-green-600" />
          <Label className="text-base font-medium">Do&apos;s</Label>
        </div>
        <div className="space-y-2">
          {tone.guidelines.do.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
            >
              <span className="flex-1 text-sm">{item}</span>
              <button
                onClick={() => removeDoItem(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newDoItem}
              onChange={(e) => setNewDoItem(e.target.value)}
              placeholder="e.g., Use active voice"
              onKeyDown={(e) => e.key === "Enter" && addDoItem()}
            />
            <Button onClick={addDoItem} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Don'ts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ThumbsDown className="h-4 w-4 text-red-600" />
          <Label className="text-base font-medium">Don&apos;ts</Label>
        </div>
        <div className="space-y-2">
          {tone.guidelines.dont.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg"
            >
              <span className="flex-1 text-sm">{item}</span>
              <button
                onClick={() => removeDontItem(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newDontItem}
              onChange={(e) => setNewDontItem(e.target.value)}
              placeholder="e.g., Avoid jargon"
              onKeyDown={(e) => e.key === "Enter" && addDontItem()}
            />
            <Button onClick={addDontItem} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Example Phrases */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Example Phrases</Label>
        <p className="text-sm text-muted-foreground">
          Add sample copy that captures your desired voice
        </p>
        <div className="space-y-2">
          {tone.examplePhrases.map((phrase, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-muted/50 border rounded-lg"
            >
              <span className="flex-1 text-sm italic">&ldquo;{phrase}&rdquo;</span>
              <button
                onClick={() => removePhrase(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              placeholder='e.g., "Ship faster, not harder."'
              onKeyDown={(e) => e.key === "Enter" && addPhrase()}
            />
            <Button onClick={addPhrase} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tone Inspirations */}
      <InspirationUploader
        inspirations={tone.inspirations || []}
        onUpdate={handleInspirationsUpdate}
        title="Copy Inspirations"
        description="Add screenshots or URLs of copy examples you like. Include notes about what appeals to you."
        uploadCategory="tone-inspirations"
      />
    </OnboardingShell>
  );
}
