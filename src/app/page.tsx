"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandfallProvider, useLandfall } from "@/lib/context";
import { STEPS } from "@/lib/types";
import { Loader2 } from "lucide-react";

function RedirectToCurrentStep() {
  const router = useRouter();
  const { currentStep, isLoading } = useLandfall();

  useEffect(() => {
    if (!isLoading) {
      const step = STEPS.find((s) => s.id === currentStep) || STEPS[0];
      router.replace(`/step/${step.slug}`);
    }
  }, [currentStep, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your project...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <LandfallProvider>
      <RedirectToCurrentStep />
    </LandfallProvider>
  );
}
